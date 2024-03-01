#!/usr/bin/env node
// import 'source-map-support/register';
import {
  App, Tags,
} from 'aws-cdk-lib';
import { MainStack } from '../lib/main-stack';
import { EcrStack } from '../lib/ecr-stack';

const app = new App();
Tags.of(app).add('repository', 'selenium-ecs-sample');
Tags.of(app).add('createdby', 'aws-cdk');

// .github/workflows/main.yaml env.REPOSITORYと同じ値にすること
const projectName = 'selenium-ecs-sample'
const owner = "YutaOkoshi"
const repo = "selenium-ecs-sample"

const ecrStack = new EcrStack(app, 'EcrStack', { stackName: `${projectName}EcrStack`, projectName: projectName, gitHubRepositoryName: repo, gitHubOwner: owner });
const mainStack = new MainStack(app, 'MainStack', { stackName: `${projectName}MainStack`, repository: ecrStack.repository, projectName: projectName });
