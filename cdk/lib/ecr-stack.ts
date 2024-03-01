import {
  Stack, StackProps, CfnOutput,
  aws_ecr as ecr,
  aws_iam as iam,
} from 'aws-cdk-lib';
import {
  Construct
} from 'constructs';
import {
  GithubActionsIdentityProvider, GithubActionsRole, IGithubActionsIdentityProvider
} from "aws-cdk-github-oidc";


interface CustomProps extends StackProps {
  projectName: string
  gitHubOwner: string
  gitHubRepositoryName: string
}

export class EcrStack extends Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: CustomProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, 'Repository', {
      repositoryName: props.projectName,
    });

    // GitHub用のIAMプロバイダーは1アカウント１つしか作れないのですでにある場合は利用する
    const provider = (hasGithubActionsIdentityProvider: string): IGithubActionsIdentityProvider => {
      if (hasGithubActionsIdentityProvider === 'true') {
        return GithubActionsIdentityProvider.fromAccount(this, "GithubProvider");
      } else {
        return new GithubActionsIdentityProvider(this, "GithubProvider")
      }
    }

    // GitHub ActionsからECSへPushできるようにIAM RoleとIAMプロバイダーを追加
    const ghRole = new GithubActionsRole(this, "GithubRole", {
      provider: provider(this.node.tryGetContext('hasGithubActionsIdentityProvider')),
      owner: props.gitHubOwner, // your repository owner (organization or user) name
      repo: props.gitHubRepositoryName, // your repository name (without the owner name)
      // TODO:
      // filter: "ref:refs/tags/v*", // JWT sub suffix filter, defaults to '*'
    });
    this.repository.grantPush(ghRole);
    // logGroup.grantWrite(taskExecRole);
    ghRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonECS_FullAccess'));

    new CfnOutput(this, 'IAM ROLE ARN', {
      value: ghRole.roleArn,
      description: 'IAM ROLE ARN',
      exportName: 'IamRoleARN'
    });
  }
}
