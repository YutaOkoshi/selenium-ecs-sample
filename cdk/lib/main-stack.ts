import {
  Stack, StackProps, CfnOutput,
  aws_ec2 as ec2,
  aws_ecs as ecs,
  aws_ecr as ecr,
  aws_rds as rds,
  aws_elasticloadbalancingv2 as elbv2,
  aws_ecs_patterns as ecs_patterns,
  aws_iam as iam,
  aws_autoscaling as autoscaling,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface CustomProps extends StackProps {
  repository: ecr.Repository
  projectName: string
}

export class MainStack extends Stack {
  public readonly vpc: ec2.Vpc;
  public readonly cluster: ecs.Cluster;
  public readonly auroraPg: rds.DatabaseCluster;
  public readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: CustomProps) {
    super(scope, id, props);

    // TODO: devと STGはAZとNAT GW２つもいらない
    // const natGatewayProvider = ec2.NatProvider.gateway();
    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'app',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'rds',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
      ]
      // natGatewayProvider: natGatewayProvider,
      // natGateways: 2
    });

    this.cluster = new ecs.Cluster(this, 'Cluster', { vpc: this.vpc });

    const image = ecs.ContainerImage.fromEcrRepository(props.repository, 'latest');// 初回CDKデプロイ時はとりあえずLatest

    const service = new ecs_patterns.ScheduledFargateTask(this, 'Service', {
      schedule: autoscaling.Schedule.expression('rate(5 minute)'),
      cluster: this.cluster,
      platformVersion: ecs.FargatePlatformVersion.LATEST,
      subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
      memoryLimitMiB: 1024,
      cpu: 512,
      scheduledFargateTaskImageOptions: {
        image: image,
        memoryLimitMiB: 512,
      },
      // taskSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      // openListener: true,
    });
    service.taskDefinition.executionRole?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonECS_FullAccess'));


    new CfnOutput(this, 'Cluster Name', {
      value: service.cluster.clusterName,
      description: 'Cluster Name',
      exportName: 'ClusterName'
    });

    new CfnOutput(this, 'Task Definition ARN', {
      value: service.taskDefinition.taskDefinitionArn,
      description: 'Task Definition ARN',
      exportName: 'TaskDefinitionARN'
    });

  }
}
