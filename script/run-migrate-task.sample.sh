#!/bin/bash
#
# ECS Exec を有効化して run-task
#

# クラスター名
CLUSTER_NAME="xxxxxxxxxxxxxxxxx"
# サブネットID
SUBNET_ID="subnet-xxxxxxxxxxxxxxxxx"
# タスク定義名
TASK_NAME="xxxxxxxxxxxxxxxxx"
# セキュリティグループID
SG_ID="sg-xxxxxxxxxxxxxxxxxx"
# aws profile name
PROFILE_NAME="xxxxxx"
# パブリックIP割当て（ENABLED もしくは DISABLED）
PUBLIC_IP_ASSIGN="DISABLED"

# タスク定義 ARN
TASK_DEF_ARN=$(aws ecs list-task-definitions \
--family-prefix "${TASK_NAME}" \
--query "reverse(taskDefinitionArns)[0]" \
--output text --profile "${PROFILE_NAME}" ) \
&& echo "${TASK_DEF_ARN}"

# ネットワーク
NETWORK_CONFIG="awsvpcConfiguration={subnets=[${SUBNET_ID}],securityGroups=[${SG_ID}],assignPublicIp=${PUBLIC_IP_ASSIGN}}"

# タスク実行
aws ecs run-task \
--region ap-northeast-1 \
--cluster "${CLUSTER_NAME}" \
--task-definition "${TASK_DEF_ARN}" \
--network-configuration "${NETWORK_CONFIG}" \
--launch-type FARGATE \
--enable-execute-command \
--overrides '{"containerOverrides": [{"name": "selenium-ecs-sample", "command":["yarn","prisma","migration","deploy"] }]}' \
--profile "${PROFILE_NAME}"

