# selenium-ecs-sample


## about

- Deploy Flow
- ![deployflow drawio (1)](https://github.com/YutaOkoshi/selenium-ecs-sample/assets/37532269/33f75c72-e47f-430e-91fd-947c851ab59d)

- Cloudformation Stack
- ![resource drawio](https://github.com/YutaOkoshi/selenium-ecs-sample/assets/37532269/a3941b07-92d1-4c7f-9df3-e5cf7e38abda)


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

![スクリーンショット 2024-03-02 0 45 11](https://github.com/YutaOkoshi/selenium-ecs-sample/assets/37532269/0202ea20-8ddc-4de8-8478-12bc85408cf5)

5. Git Push for Deploy to ECS

```bash
$ git push
```

