# selenium-ecs-sample


## about

- Deploy Flow
- ![deployflow drawio](https://github.com/YutaOkoshi/selenium-ecs-sample/assets/37532269/c53f36de-74a7-4ece-a374-8b7857544f40)

- Cloudformation Stack
- ![resorces drawio (1)](https://github.com/YutaOkoshi/selenium-ecs-sample/assets/37532269/19446fff-6c55-47d5-8aad-56074ff0f8c5)


## deploy to aws

1. Check IAM ID Provider

- Only one IAM ID provider for GitHub can be created per AWS account, so if one already exists, change context `hasGithubActionsIdentityProvider` in cdk.json

cdk/cdk.json
```json

~~~
  },
  "context": {
    "hasGithubActionsIdentityProvider": "true", // true | false
~~~~

```



2. cdk deploy

```bash
$ cd cdk

$ npm i
$ npx cdk bootstrap
$ npx cdk deploy EcrStack

Outputs:
EcrStack.ExportsOutputFnGetAttRepository12341 = arn:aws:ecr:ap-northeast-1:123412341234:repository/selenium-ecs-sample
EcrStack.ExportsOutputRefRepository12341 = selenium-ecs-sample
EcrStack.IAMROLEARN = arn:aws:iam::123412341234:role/selenium-ecs-sampleEcrStack-GithubRole1F7504EA-aaaaaaaaa
Stack ARN:
arn:aws:cloudformation:ap-northeast-1:123412341234:stack/selenium-ecs-sampleEcrStack/1234-abc-efg-1234-123412341234

// COPY 'EcrStack.IAMROLEARN' !
```


2. Docker push to ECR

```bash

$ cd ./app
$ aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 123412341234.dkr.ecr.ap-northeast-1.amazonaws.com
$ docker build --platform linux/amd64 -t selenium-ecs-sample .
$ docker tag selenium-ecs-sample:latest 123412341234.dkr.ecr.ap-northeast-1.amazonaws.com/selenium-ecs-sample:latest
$ docker push 123412341234.dkr.ecr.ap-northeast-1.amazonaws.com/selenium-ecs-sample:latest
```

3. cdk deploy main stack

```bash
$ cd ../cdk
$ npx cdk deploy MainStack

Outputs:
MainStack.ClusterName = selenium-ecs-sampleMainStack-Cluster1234123-12341234
MainStack.TaskDefinitionARN = arn:aws:ecs:ap-northeast-1:123412341234:task-definition/MainStackServiceScheduledTaskDef12341234:1

```

4. Setting GitHub Actions Variables

- Variables
  - AWS_IAM_ROLE_ARN
  - AWS_REGION
  - ECS_CLUSTER_NAME
  - ECS_TASK_DEFINITION_ARN

![スクリーンショット 2023-11-27 20 54 16](https://github.com/YutaOkoshi/selenium-ecs-sample-on-ecs/assets/37532269/331a1858-acca-493f-8b8c-7830c74dec29)

5. Git Push for Deploy to ECS

```bash
$ git push
```

