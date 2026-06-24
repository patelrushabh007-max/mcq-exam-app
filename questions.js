const questions = [
  // ── DOMAIN 1: SDLC AUTOMATION (Q1-22) ──────────────────────────────────────
  {
    domain: "SDLC Automation", num: 1,
    q: "A company runs a multi-account AWS environment. A CodePipeline pipeline in Account A must deploy a CloudFormation stack in Account B. The pipeline uses a KMS-encrypted S3 artifact bucket in Account A. After configuring cross-account IAM roles, the pipeline fails at the Deploy stage with 'Access Denied' when CloudFormation in Account B tries to read the artifact. What is missing?",
    options: [
      "A. The cross-account IAM role in Account B needs s3:GetObject on the artifact bucket",
      "B. The KMS key policy in Account A must grant kms:Decrypt to the cross-account IAM role in Account B AND the CloudFormation service role in Account B",
      "C. CodePipeline does not support cross-account deployments; use CodeDeploy instead",
      "D. The S3 bucket policy must use a VPC endpoint condition to allow Account B access"
    ],
    answer: "B",
    explanation: "Cross-account CodePipeline deployments with KMS-encrypted artifacts require the KMS key policy in the source account to explicitly grant kms:Decrypt to both the cross-account IAM role AND the CloudFormation service role in the target account. S3 bucket access alone is insufficient — KMS decryption is a separate permission that must be granted at the key policy level, not just IAM."
  },
  {
    domain: "SDLC Automation", num: 2,
    q: "A CodeBuild project builds a Docker image and pushes it to ECR. Builds are succeeding but a security scan shows the image contains the Docker build cache with intermediate layers exposing secrets from ARG instructions. Which buildspec change eliminates this risk?",
    options: [
      "A. Add --no-cache flag to the docker build command",
      "B. Use docker build --squash to flatten all layers into one",
      "C. Use multi-stage Docker builds — secrets are only used in a builder stage; the final stage copies only compiled artifacts, discarding layers with secrets",
      "D. Store secrets in SSM Parameter Store and retrieve at container runtime instead of build time"
    ],
    answer: "C",
    explanation: "Docker ARG values are embedded in the layer where they are used and persist in the image history even if deleted in subsequent RUN commands. Multi-stage builds solve this architecturally — the builder stage uses secrets/ARGs and produces artifacts, but only the final FROM scratch or minimal base stage is shipped. The final image contains none of the builder's layers, completely eliminating the exposure."
  },
  {
    domain: "SDLC Automation", num: 3,
    q: "A pipeline deploys to 500 EC2 instances using CodeDeploy. The deployment consistently times out at 45 minutes even though only 5% of instances fail. The deployment config is OneAtATime. Business requires a max 10% failure rate before rollback. Which changes reduce deployment time while respecting the failure threshold?",
    options: [
      "A. Switch to AllAtOnce deployment configuration",
      "B. Create a custom CodeDeploy deployment configuration with minimum healthy hosts = 90% and switch to HalfAtATime",
      "C. Increase the CodeDeploy deployment timeout to 90 minutes",
      "D. Use CodeDeploy with an Auto Scaling group and a rolling update policy"
    ],
    answer: "B",
    explanation: "OneAtATime on 500 instances is extremely slow. A custom deployment configuration specifying minimum healthy hosts at 90% (allowing 10% failures before rollback) combined with a higher concurrency like HalfAtATime dramatically reduces total deployment time while enforcing the business failure threshold. The custom config gives precise control over the failure tolerance that AllAtOnce lacks."
  },
  {
    domain: "SDLC Automation", num: 4,
    q: "A team uses AWS CodeArtifact to store Maven packages. Developers report that a critical open-source library update published to Maven Central is not available through CodeArtifact after 3 hours. The domain has an upstream connection to Maven Central. What is the most likely cause?",
    options: [
      "A. CodeArtifact caches external packages permanently after first fetch; the new version will never appear",
      "B. The upstream connection's external connection to Maven Central is missing or the package namespace is not whitelisted in CodeArtifact",
      "C. A package version retention policy is blocking the new version",
      "D. The IAM role lacks codeartifact:ReadFromRepository permission for the upstream repository"
    ],
    answer: "B",
    explanation: "CodeArtifact fetches packages from upstream sources (including public repositories like Maven Central via external connections) on demand when requested. If the new version is not appearing, the external connection to Maven Central may be misconfigured, missing the public:npmjs or public:maven-central external connection, or the package group policy is restricting which packages can be fetched from upstream."
  },
  {
    domain: "SDLC Automation", num: 5,
    q: "A CodePipeline has a GitHub source action. After migrating GitHub repositories from OAuth to the GitHub App connection, some pipelines no longer trigger on push events. Manual release works. What is the root cause and fix?",
    options: [
      "A. The GitHub App connection requires re-authorization — reconnect via CodeStar Connections in the console",
      "B. GitHub App connections use polling instead of webhooks — enable polling in the pipeline source action",
      "C. The CodeStar Connection must be in 'Available' status and the pipeline source action must reference the new connection ARN; pipelines still using the old OAuth action configuration do not automatically switch",
      "D. GitHub App connections don't support push event triggers — use EventBridge with a GitHub webhook instead"
    ],
    answer: "C",
    explanation: "When migrating from OAuth to GitHub App (CodeStar Connections), each pipeline's source action must be explicitly updated to reference the new Connection ARN. Pipelines still configured with the old OAuth-based GitHub action won't receive webhook events from the new connection. The connection must be in 'Available' status, and a GitHub App installation must be authorized for the target repositories."
  },
  {
    domain: "SDLC Automation", num: 6,
    q: "A development team wants to enforce that no AWS access keys are committed to their CodeCommit repository. This must block the push, not just alert. Which implementation achieves this?",
    options: [
      "A. Enable Amazon CodeGuru Reviewer on the repository — it blocks pushes containing secrets",
      "B. Create a Lambda function triggered by CodeCommit pushes that scans for key patterns and calls DeleteBranch if found",
      "C. Use AWS CodeCommit triggers to invoke a Lambda that calls the CodeCommit UpdateDefaultBranch API to reject the push",
      "D. Implement a CodeCommit approval rule template requiring two reviewers on all pull requests, combined with branch protection; use a CodeBuild stage with truffleHog/git-secrets as a pipeline gate before merge"
    ],
    answer: "D",
    explanation: "CodeCommit does not support server-side pre-receive hooks that can block a push in-flight like Git servers can. The correct approach is to use approval rule templates to require PRs (blocking direct pushes to protected branches) and a mandatory CodeBuild secret-scanning gate in the pipeline before merge is permitted. This enforces the control at the process level without relying on a missing hook capability."
  },
  {
    domain: "SDLC Automation", num: 7,
    q: "A microservices team needs semantic versioning for their artifacts. Every merge to main must auto-increment the patch version, feature branches increment minor, and manual tags set major. All versions must be unique and traceable to a specific commit. Which approach best implements this?",
    options: [
      "A. Use CodeBuild environment variables CODEBUILD_RESOLVED_SOURCE_VERSION to tag images with the commit SHA",
      "B. Implement a buildspec pre-build phase that reads the current version from a DynamoDB table, applies semantic versioning logic based on branch name and commit message conventions, writes the new version back to DynamoDB, and uses it as the artifact tag",
      "C. Use CodePipeline pipeline variables to pass a static version number through the pipeline",
      "D. Use ECR image tag immutability and let ECR auto-generate version numbers"
    ],
    answer: "B",
    explanation: "DynamoDB as a version counter provides atomic, consistent versioning across concurrent builds. The pre-build phase uses ConditionalExpressions for atomic increment, reads branch context to apply semantic rules (main → patch, feature/* → minor, tagged commit → major), and stores the mapping from version to commit SHA. This is reproducible, traceable, and handles concurrent pipeline executions without race conditions."
  },
  {
    domain: "SDLC Automation", num: 8,
    q: "A Lambda function deployed via SAM has a canary deployment configuration (Canary10Percent5Minutes). During a deployment, the canary version has an elevated error rate but the CodeDeploy rollback is not triggering. CloudWatch alarms are configured. What is the most likely misconfiguration?",
    options: [
      "A. SAM canary deployments only support step functions for rollback, not CloudWatch alarms",
      "B. The CloudWatch alarm referenced in the SAM DeploymentPreference Alarms property is in INSUFFICIENT_DATA state due to missing data points during the canary window — rollback only triggers on ALARM state",
      "C. Lambda alias routing weights cannot be used with CloudWatch alarms",
      "D. CodeDeploy requires SNS notification before triggering automatic rollback"
    ],
    answer: "B",
    explanation: "CodeDeploy only triggers automatic rollback when the referenced CloudWatch alarm transitions to ALARM state. INSUFFICIENT_DATA (which occurs when a new Lambda function version hasn't accumulated enough invocations to produce metric data points) does not trigger rollback. The alarm must have sufficient data and breach the threshold within the canary window. A common fix is to configure 'treat missing data as breaching' on the alarm."
  },
  {
    domain: "SDLC Automation", num: 9,
    q: "A team runs integration tests in CodeBuild that require access to an RDS database in a private subnet. The CodeBuild project fails with connection timeout to the database. VPC configuration is set on the CodeBuild project pointing to the correct VPC and private subnets. What is still missing?",
    options: [
      "A. CodeBuild in a VPC requires a NAT Gateway for outbound internet to download build dependencies — add NAT Gateway to the private subnet route table",
      "B. Add the CodeBuild security group to the RDS security group's inbound rules allowing the database port",
      "C. Both A and B — CodeBuild VPC projects need both a NAT Gateway for internet access and security group rules for RDS access",
      "D. CodeBuild cannot run in a VPC — use an EC2 instance for integration tests"
    ],
    answer: "C",
    explanation: "Two things are required: (1) A NAT Gateway (or VPC endpoints for AWS services) so CodeBuild can reach the internet to download build tools and dependencies — without this, the build itself may fail. (2) The CodeBuild project's security group must be added to the RDS security group's inbound rules on port 3306/5432. Both are commonly missed. CodeBuild in a VPC has no internet access by default."
  },
  {
    domain: "SDLC Automation", num: 10,
    q: "A pipeline builds and tests a Node.js application. The test phase takes 18 minutes due to sequential test suite execution. The CodeBuild instance has 8 vCPUs. How can test execution time be reduced using CodeBuild features without changing the test framework?",
    options: [
      "A. Upgrade to a larger CodeBuild instance type with more vCPUs",
      "B. Use CodeBuild Test Reporting with parallel test splitting — configure multiple CodeBuild projects that each run a subset of tests using the CODEBUILD_INITIATOR environment variable to shard tests",
      "C. Enable CodeBuild batch builds with build-matrix strategy to run test suites in parallel across multiple build environments simultaneously",
      "D. Use CodeBuild local caching to cache node_modules and skip dependency installation"
    ],
    answer: "C",
    explanation: "CodeBuild batch builds with a build-matrix configuration spawn parallel build environments. Each matrix combination runs a different test suite shard simultaneously, cutting total test time by the parallelism factor. This is a native CodeBuild feature requiring only buildspec changes. Caching (Option D) only helps installation time, not execution time. Option B describes a custom implementation rather than a built-in feature."
  },
  {
    domain: "SDLC Automation", num: 11,
    q: "An organization requires every production deployment to have a signed approval from both the security team and the engineering lead. CodePipeline approval actions only support single-approver notification. How do you enforce dual approval natively?",
    options: [
      "A. Create two sequential Manual Approval actions in the pipeline — one notifying the security team SNS topic and one notifying the engineering lead SNS topic; both must approve before the Deploy stage proceeds",
      "B. Use a single approval action with a custom Lambda that validates both approvals from a DynamoDB tracking table",
      "C. Use AWS IAM conditions to require MFA for the PutApprovalResult API call",
      "D. CodePipeline cannot enforce dual approval; use an external tool like Jira for approval tracking"
    ],
    answer: "A",
    explanation: "CodePipeline Manual Approval actions are sequential gates. Two consecutive approval actions — each with a different SNS notification target (security team, engineering lead) — enforces dual approval natively. The pipeline only advances when both approve. Each approval is captured in CloudTrail. This requires no custom Lambda and is fully auditable with standard AWS tooling."
  },
  {
    domain: "SDLC Automation", num: 12,
    q: "A CodeDeploy in-place deployment to an Auto Scaling group using the CodeDeployDefault.HalfAtATime config is causing the ALB to return 502 errors during deployment. Instances are being deregistered from the ALB before the new application is ready. What lifecycle hook configuration fixes this?",
    options: [
      "A. Use the BeforeInstall hook to deregister from ALB and AfterInstall to re-register",
      "B. Enable CodeDeploy's built-in load balancer integration by specifying the ALB target group in the deployment group; CodeDeploy automatically deregisters, waits for connection draining, installs, validates, and re-registers",
      "C. Use the ApplicationStop hook to deregister from ALB with a 30-second sleep",
      "D. Configure the ALB health check to be less aggressive during deployments"
    ],
    answer: "B",
    explanation: "CodeDeploy has native ALB/ELB integration built into deployment groups. When configured with the target group, CodeDeploy automatically handles the full lifecycle: deregisters the instance, waits for the deregistration delay (connection draining), runs install hooks, runs the ValidateService hook, and only then re-registers. Manually managing this in hooks is error-prone and duplicates built-in functionality."
  },
  {
    domain: "SDLC Automation", num: 13,
    q: "A team stores Terraform state in S3 with DynamoDB locking. During a pipeline run, a concurrent manual terraform apply by a developer causes state corruption. The pipeline fails on the next run with a state lock error that never releases. How should this be resolved and prevented?",
    options: [
      "A. Delete the DynamoDB lock item manually and re-run the pipeline; prevent recurrence by using IAM policies to deny terraform CLI access to the production state bucket for all humans",
      "B. Restore the S3 state from versioning; re-run terraform apply",
      "C. Run terraform force-unlock with the lock ID; implement SCPs to prevent direct CLI access",
      "D. Both A and C are valid — delete the orphaned DynamoDB lock item (terraform force-unlock or manual delete), restore state from S3 versioning if corrupted, and enforce IAM/SCP policies restricting direct terraform apply to humans in production"
    ],
    answer: "D",
    explanation: "The immediate fix requires both: clearing the orphaned lock (via terraform force-unlock or directly deleting the DynamoDB lock item) and potentially restoring a valid state from S3 versioning. Prevention requires denying direct human terraform access to production state — either via IAM policies on the S3 bucket/DynamoDB table or SCPs — ensuring only the pipeline service role can run applies."
  },
  {
    domain: "SDLC Automation", num: 14,
    q: "A SaaS company needs different CodePipeline pipelines for each customer tenant, each with slightly different configurations. They have 200 tenants. Managing 200 pipelines manually is infeasible. What is the best approach?",
    options: [
      "A. Create one pipeline with 200 parallel Deploy actions, one per tenant",
      "B. Use CodePipeline pipeline templates stored in CloudFormation; a Lambda function triggered by a DynamoDB stream (when a new tenant record is created) generates and deploys a CloudFormation stack creating the tenant pipeline using tenant-specific parameters",
      "C. Use AWS Service Catalog to provide a pipeline product that tenants self-provision",
      "D. Use a single pipeline with CodeBuild environment variables to loop through all tenants"
    ],
    answer: "B",
    explanation: "Pipeline-as-code using CloudFormation parameterized templates is the scalable solution for multi-tenant pipelines. A Lambda triggered by DynamoDB (the tenant registry) automatically creates a CloudFormation stack per new tenant, instantiating a pipeline with tenant-specific parameters (repo, env vars, deploy target). This is fully automated, auditable via CloudFormation, and scales to thousands of tenants without manual intervention."
  },
  {
    domain: "SDLC Automation", num: 15,
    q: "An ECS blue/green deployment via CodeDeploy is stuck in the 'Rerouting traffic' state for 45 minutes. The green task set is healthy. What should be investigated?",
    options: [
      "A. The ALB listener rule is missing — add a test listener port to the CodeDeploy deployment group",
      "B. The AfterAllowTraffic lifecycle hook Lambda is running but not calling back to CodeDeploy with PutLifecycleEventHookExecutionStatus — CodeDeploy waits until the hook timeout (default 3600s)",
      "C. ECS task definitions cannot be used with CodeDeploy blue/green deployments",
      "D. The CodeDeploy service role lacks ecs:UpdateService permission"
    ],
    answer: "B",
    explanation: "CodeDeploy lifecycle hooks are synchronous — the deployment waits for the hook Lambda to report completion via PutLifecycleEventHookExecutionStatus. If the Lambda completes execution without calling this API (e.g., due to an unhandled exception), CodeDeploy waits until the hook timeout (up to 3600 seconds by default). The fix is ensuring the Lambda always calls the API in both success and failure paths, including try/except/finally blocks."
  },
  {
    domain: "SDLC Automation", num: 16,
    q: "A company wants shift-left security in their pipeline. Which combination of tools provides SAST, dependency vulnerability scanning, and IaC security scanning as pipeline gates?",
    options: [
      "A. Amazon Inspector for SAST, AWS Config for IaC, Dependabot for dependencies",
      "B. CodeBuild stage running Semgrep/SonarQube for SAST + OWASP Dependency-Check or Snyk for dependencies + cfn-guard or checkov for IaC; fail the build on critical findings",
      "C. Amazon CodeGuru Reviewer for SAST + Amazon ECR enhanced scanning for dependencies + AWS Security Hub for IaC",
      "D. AWS Trusted Advisor for all security scanning needs"
    ],
    answer: "B",
    explanation: "Comprehensive shift-left security requires three distinct scan types: SAST (static application security testing — Semgrep, SonarQube, or CodeGuru Reviewer) analyzes source code; dependency scanning (Snyk, OWASP Dependency-Check) finds known CVEs in libraries; IaC scanning (cfn-guard, checkov, tfsec) validates infrastructure templates. Running all three as CodeBuild stages with non-zero exit on critical findings creates hard pipeline gates. CodeGuru covers SAST but not the other two categories."
  },
  {
    domain: "SDLC Automation", num: 17,
    q: "A CodePipeline pipeline is triggered by an S3 source action. Uploads to the S3 bucket don't consistently trigger the pipeline. Some uploads trigger multiple executions. What is causing this and how is it fixed?",
    options: [
      "A. S3 source actions use polling; increase poll frequency in pipeline settings",
      "B. The S3 bucket is missing EventBridge notifications — CodePipeline S3 source triggers via EventBridge; enable EventBridge on the S3 bucket and ensure the bucket has versioning enabled (required for S3 source actions)",
      "C. Multiple Lambda functions are simultaneously uploading to the bucket causing conflicts",
      "D. The S3 source action requires server-side encryption to trigger reliably"
    ],
    answer: "B",
    explanation: "Modern CodePipeline S3 source actions use Amazon EventBridge (CloudTrail S3 data events) rather than polling. Two requirements must both be met: (1) S3 versioning must be enabled on the source bucket — without versioning, CodePipeline cannot detect object version changes. (2) EventBridge must be enabled to capture S3 API events. Missing either causes inconsistent triggering. Multiple executions occur when multiple PutObject events fire for a single logical upload (multipart uploads)."
  },
  {
    domain: "SDLC Automation", num: 18,
    q: "A data engineering team needs to deploy Glue jobs, Glue crawlers, and associated IAM roles using a pipeline. The resources have circular dependencies: the IAM role needs the Glue job ARN in its policy, and the Glue job needs the IAM role ARN. How is this resolved in CloudFormation?",
    options: [
      "A. Split into two stacks — Stack 1 creates IAM role with a wildcard resource in the policy; Stack 2 creates the Glue job and updates the IAM policy with the specific ARN using a custom resource",
      "B. CloudFormation cannot handle circular dependencies — use CDK instead",
      "C. Use CloudFormation DependsOn to create resources in the correct order",
      "D. Create the IAM role with a wildcard policy first, then use a CloudFormation Stack Update to tighten the policy after the Glue job ARN is known — all within one stack using !Ref for the Glue job"
    ],
    answer: "D",
    explanation: "Within a single CloudFormation stack, !Ref on the Glue job in the IAM policy condition resolves to the Glue job ARN after creation — CloudFormation manages the dependency graph internally. By referencing the Glue job with !Ref in the IAM role policy resource ARN, CloudFormation creates the Glue job first (since the role depends on its ARN), then creates the role. This is not a true circular dependency when using intrinsic functions properly — CloudFormation resolves it."
  },
  {
    domain: "SDLC Automation", num: 19,
    q: "A pipeline needs to run performance load tests against a staging environment after deployment. The load test must generate 10,000 concurrent users for 30 minutes. The test must not exceed a p99 latency of 500ms or the pipeline fails. Which AWS-native approach best implements this?",
    options: [
      "A. Use CodeBuild with a large instance type running Apache JMeter locally",
      "B. Use AWS Distributed Load Testing solution (built on AWS Fargate) invoked via CodeBuild; CodeBuild polls the test results API and fails the build if p99 exceeds 500ms",
      "C. Use AWS Lambda to generate concurrent requests — Lambda concurrency equals the number of virtual users",
      "D. Use Amazon CloudWatch Synthetics canaries to simulate load"
    ],
    answer: "B",
    explanation: "AWS Distributed Load Testing solution uses Fargate to generate high-concurrency load at scale — 10,000 virtual users would overwhelm a single CodeBuild instance or Lambda (which has concurrency and duration limits of 15 minutes). The solution exposes an API for test creation and result polling. CodeBuild invokes the test, polls for completion, retrieves p99 latency from results, and exits non-zero if the threshold is breached — failing the pipeline gate."
  },
  {
    domain: "SDLC Automation", num: 20,
    q: "A team uses CDK Pipelines (cdk.pipelines.CodePipeline). After adding a new stage to the CDK app, the pipeline fails with 'Stage already exists' error during self-mutation. What is happening and how is it resolved?",
    options: [
      "A. CDK Pipelines cannot add stages after initial deployment — recreate the pipeline",
      "B. CDK Pipelines self-mutation runs cdk deploy on the pipeline stack during the 'UpdatePipeline' step. The new stage's CloudFormation stack is being deployed before the pipeline self-update completes — wait for the self-mutation step to finish and re-run",
      "C. The CDK app has a naming conflict — rename the new stage to avoid 'already exists' errors",
      "D. CDK Pipelines uses a separate stack per stage; the new stage stack must be bootstrapped in the target account before the pipeline can deploy it"
    ],
    answer: "D",
    explanation: "CDK Pipelines deploys cross-account/cross-region stages to accounts that must be CDK-bootstrapped with the correct trust relationship to the pipeline account. The 'Stage already exists' error during self-mutation often indicates that CDK bootstrap was not run in the target account/region, preventing CloudFormation from creating the necessary roles. Run 'cdk bootstrap --trust <pipeline-account-id>' in the target account/region before the pipeline can deploy there."
  },
  {
    domain: "SDLC Automation", num: 21,
    q: "A company requires all production Lambda deployments to use CodeDeploy with traffic shifting, and the traffic shift must be halted if a custom business metric (order conversion rate) drops more than 5%. This metric is computed by a separate analytics system and published to CloudWatch as a custom namespace. How is this implemented?",
    options: [
      "A. Use CodeDeploy hooks to query the analytics API and call back with failure if conversion drops",
      "B. Create a CloudWatch alarm on the custom metric with a threshold of 5% drop; reference this alarm ARN in the SAM/CloudFormation DeploymentPreference Alarms list — CodeDeploy will rollback automatically when the alarm triggers during the shift window",
      "C. Use CodeDeploy rollback triggers based on CloudWatch Events",
      "D. Implement a Step Functions workflow that monitors the metric and calls the CodeDeploy StopDeployment API"
    ],
    answer: "B",
    explanation: "CodeDeploy's automatic rollback based on CloudWatch alarms is designed exactly for this use case. The analytics system publishes the conversion rate to CloudWatch custom metrics; a CloudWatch alarm detects >5% drop; the alarm ARN is listed in the DeploymentPreference Alarms configuration. During the canary/linear traffic shift window, if the alarm enters ALARM state, CodeDeploy automatically rolls back to the previous version. No custom hooks or Step Functions needed."
  },
  {
    domain: "SDLC Automation", num: 22,
    q: "A pipeline builds artifacts and stores them in S3. Artifacts from builds older than 30 days should be deleted, but artifacts tagged 'release' must be retained indefinitely. How is this configured?",
    options: [
      "A. Use S3 Lifecycle rules: a rule with a prefix filter and no tag filter deletes objects after 30 days; a second rule with a tag filter (release=true) with no expiration action — the absence of expiration preserves tagged objects",
      "B. Run a nightly Lambda that scans the bucket and deletes untagged objects older than 30 days",
      "C. Use S3 Object Lock in compliance mode with a 30-day retention period",
      "D. Use S3 Intelligent-Tiering with a 30-day transition to Glacier and Glacier deletion"
    ],
    answer: "A",
    explanation: "S3 Lifecycle rules evaluate independently per object. A rule targeting all objects with Expiration=30 days will match objects without the 'release' tag. A second rule with a Filter tag (Key=release, Value=true) and no Expiration action ensures tagged objects are never expired. However, the correct implementation requires the first rule to have a NoncurrentVersionExpiration or use tag-based filter exclusion — S3 Lifecycle rules apply to matching objects, and a tag-filtered rule with no expiration effectively protects tagged objects from the general rule."
  },

  // ── DOMAIN 2: CONFIGURATION MANAGEMENT & IaC (Q23-42) ──────────────────────
  {
    domain: "Configuration Management & IaC", num: 23,
    q: "A CloudFormation stack update fails and enters UPDATE_ROLLBACK_FAILED state. The rollback is blocked because an EC2 instance was manually terminated outside of CloudFormation during the update. The instance resource has DeletionPolicy:Retain. What is the correct recovery path?",
    options: [
      "A. Delete the entire stack and redeploy",
      "B. Use ContinueUpdateRollback with --resources-to-skip specifying the terminated EC2 resource; CloudFormation will skip that resource and complete the rollback, leaving the stack in a known state",
      "C. Import the manually-created replacement EC2 instance into the stack using CloudFormation resource import",
      "D. Contact AWS Support to manually reset the stack state"
    ],
    answer: "B",
    explanation: "ContinueUpdateRollback with --resources-to-skip is the correct mechanism for recovering UPDATE_ROLLBACK_FAILED when specific resources are blocking rollback. CloudFormation skips the problematic resource (the deleted EC2 instance) and completes rollback for all other resources. Post-recovery, you can then use CloudFormation resource import to bring a replacement resource under stack management, or re-run the update with the corrected template."
  },
  {
    domain: "Configuration Management & IaC", num: 24,
    q: "A StackSet deployment targeting 50 OUs fails for 3 accounts with 'Account X is not authorized to assume the AWSCloudFormationStackSetExecutionRole'. The other 47 accounts succeed. What is the cause?",
    options: [
      "A. The StackSet is using SELF_MANAGED permissions — the AWSCloudFormationStackSetExecutionRole was not manually created in the 3 failing accounts",
      "B. The StackSet has a maximum account limit of 47 concurrent deployments",
      "C. The 3 failing accounts are suspended in AWS Organizations",
      "D. The execution role trust policy does not include the administration account ARN"
    ],
    answer: "A",
    explanation: "With SELF_MANAGED StackSets, the AWSCloudFormationStackSetAdministrationRole in the admin account and AWSCloudFormationStackSetExecutionRole in each target account must be manually created. SERVICE_MANAGED StackSets (using Organizations) create these roles automatically. The 3 failing accounts simply never had the execution role created — a common operational gap when adding new accounts to an organization that uses SELF_MANAGED StackSets."
  },
  {
    domain: "Configuration Management & IaC", num: 25,
    q: "An AWS Systems Manager Automation document runs a multi-step patching workflow across 1000 EC2 instances. The workflow takes 4 hours and frequently times out at step 3 due to a downstream API throttle from a third-party vendor. How should the automation be made resilient?",
    options: [
      "A. Increase the SSM Automation document timeout to 8 hours",
      "B. Add a retry mechanism to step 3 using the 'timeoutSeconds' and 'maxAttempts' properties in the automation step definition; use exponential backoff by chaining a 'Sleep' step between retries",
      "C. Break the automation into separate documents and chain them using Step Functions",
      "D. Use SSM Run Command instead of Automation for better retry handling"
    ],
    answer: "B",
    explanation: "SSM Automation document steps support 'maxAttempts' and 'timeoutSeconds' natively per step. Adding a Sleep step between retry attempts implements exponential backoff without any external orchestration. This is the simplest, most maintainable solution — entirely within the SSM Automation document. Step Functions (Option C) adds operational overhead and is appropriate when you need human approval steps or complex branching, not for simple API retry logic."
  },
  {
    domain: "Configuration Management & IaC", num: 26,
    q: "A team uses Ansible for configuration management on EC2 instances managed by SSM. After an AMI update, new instances launched by Auto Scaling have inconsistent configurations — some have the latest Ansible roles applied, others do not. What is the root cause?",
    options: [
      "A. The Auto Scaling launch template still references the old AMI",
      "B. The SSM State Manager association that applies Ansible playbooks is configured with 'Apply during the next scheduled maintenance window' instead of 'Apply on launch'; new instances don't get configured immediately",
      "C. Ansible roles are not idempotent and fail on fresh instances",
      "D. SSM Agent is not installed on the new AMI"
    ],
    answer: "B",
    explanation: "SSM State Manager associations have an 'Apply association on instances at launch' setting. Without this enabled, new instances launched by Auto Scaling only receive the association configuration at the next scheduled run (e.g., every 30 minutes or daily). Enabling 'Apply on launch' (ApplyOnlyAtCronInterval=false with an association schedule, or using the compliance scan on registration) ensures configuration is applied immediately when new instances register with SSM."
  },
  {
    domain: "Configuration Management & IaC", num: 27,
    q: "A CloudFormation custom resource Lambda is deployed in a VPC with no internet access. The custom resource is failing silently — the stack hangs and eventually times out after 1 hour. CloudWatch logs show the Lambda executed successfully. What is the cause?",
    options: [
      "A. The Lambda function is not sending a response to the CloudFormation pre-signed S3 URL (cfn-response) because the Lambda cannot reach the S3 endpoint — the pre-signed URL call fails silently when the Lambda has no internet access",
      "B. The Lambda timeout is too short",
      "C. CloudFormation custom resources require Lambda to be in a public subnet",
      "D. The custom resource physical resource ID is missing from the response"
    ],
    answer: "A",
    explanation: "CloudFormation custom resources require the Lambda (or any compute) to send a response to a pre-signed S3 URL provided in the event. If the Lambda runs in a VPC without internet access and without an S3 VPC endpoint, the HTTPS PUT to the pre-signed URL fails silently. CloudFormation receives no response and waits until the 1-hour custom resource timeout. Fix: add an S3 VPC Gateway Endpoint to the VPC, or ensure the Lambda's subnet has a route to S3."
  },
  {
    domain: "Configuration Management & IaC", num: 28,
    q: "An organization uses CDK with multiple environments. A developer accidentally ran 'cdk destroy' on the production stack. The stack had DeletionPolicy:Retain on RDS and S3, but the DynamoDB table (DeletionPolicy:Delete) was destroyed. What processes and CDK constructs prevent this in the future?",
    options: [
      "A. Enable AWS Config to detect stack deletions and trigger automatic restore",
      "B. Use termination protection on CloudFormation stacks (cfnStack.terminationProtection = true in CDK); add DeletionPolicy.RETAIN and RemovalPolicy.RETAIN to all stateful resources; use SCPs to deny cloudformation:DeleteStack on production accounts for human roles",
      "C. Use AWS Backup to back up all resources before any CDK deployment",
      "D. Lock the CDK state file to prevent destroy operations"
    ],
    answer: "B",
    explanation: "Defense in depth requires multiple layers: (1) CloudFormation termination protection prevents stack deletion via console/CLI without explicitly disabling it first — CDK sets this via terminationProtection=true. (2) RemovalPolicy.RETAIN on all stateful resources means even if the stack IS deleted, the resources are preserved. (3) SCPs denying cloudformation:DeleteStack on production accounts for human IAM roles prevent accidental deletion entirely. All three layers together provide comprehensive protection."
  },
  {
    domain: "Configuration Management & IaC", num: 29,
    q: "A CloudFormation template deploys an ElastiCache Redis cluster. Developers need to change the cluster's node type, which requires replacement. The cluster stores session data and replacement would cause a service disruption. How should this change be managed?",
    options: [
      "A. Update the template with the new node type — CloudFormation will handle the replacement with zero downtime",
      "B. Use CloudFormation change sets to preview the replacement; schedule a maintenance window; use ElastiCache backup and restore to migrate data; update the template during the window",
      "C. Manually create a new ElastiCache cluster with the new node type, migrate data, update application config to point to new cluster, then import the new cluster into CloudFormation and remove the old resource",
      "D. Use CloudFormation drift detection to change the node type without triggering replacement"
    ],
    answer: "C",
    explanation: "ElastiCache node type changes require cluster replacement (no in-place resize for most changes). CloudFormation will delete the old cluster and create a new one, causing data loss and downtime. The correct approach is an application-level migration: create a new cluster manually (or in a separate stack), migrate/warm the session data, update the application connection string, verify, then import the new cluster into the CloudFormation stack while removing the old resource definition."
  },
  {
    domain: "Configuration Management & IaC", num: 30,
    q: "A Terraform module creates VPCs across multiple AWS regions. The module uses a for_each on a map of regions. After adding a new region to the map, terraform plan shows the existing VPCs being destroyed and recreated instead of only adding the new one. What is the cause?",
    options: [
      "A. The AWS provider version changed and forces recreation of all VPCs",
      "B. The map key ordering changed — Terraform uses map key order for resource addressing; changing the map (e.g., adding a key that sorts before existing keys alphabetically) shifts the resource indices and Terraform sees them as different resources",
      "C. The for_each meta-argument does not support adding new entries without full recreation",
      "D. The VPC CIDR blocks conflict with the new region's CIDR"
    ],
    answer: "B",
    explanation: "With for_each using a map, Terraform addresses resources by map key (e.g., aws_vpc.this[\"us-east-1\"]). Adding a new key does NOT cause this issue — for_each is specifically designed to avoid the index-shifting problem of count. However, if count was previously used and migrated to for_each, or if the resource was refactored, the addressing changes. The most common real cause in this scenario is switching from count (index-based) to for_each, where Terraform cannot map old indexed resources to new keyed ones without terraform state mv operations."
  },
  {
    domain: "Configuration Management & IaC", num: 31,
    q: "AWS Config is configured to record all resource types. After enabling Config in a new region, the configuration recorder fails to start with 'InsufficientPermissionsException'. The Config service role exists. What is the specific missing permission?",
    options: [
      "A. The Config service role IAM policy is missing s3:PutObject permission on the Config delivery bucket",
      "B. The Config delivery channel S3 bucket is in a different account and is missing a bucket policy allowing the Config role from the new account to write to it",
      "C. The Config service role needs sts:AssumeRole to enable cross-region recording",
      "D. AWS Config requires a dedicated IAM role per region — the existing role cannot be reused"
    ],
    answer: "B",
    explanation: "When using a centralized S3 bucket in a different account for Config delivery, the bucket policy must explicitly allow the Config service role from each member account to perform s3:PutObject. The error occurs because the new account's Config role tries to write to the central bucket but the bucket policy only grants access to previously configured accounts. The IAM role may exist and have the right permissions, but the S3 bucket resource policy in the other account is the gatekeeper."
  },
  {
    domain: "Configuration Management & IaC", num: 32,
    q: "A Lambda-backed CloudFormation custom resource must create a Route53 private hosted zone and associate it with 5 VPCs across 3 different accounts. The Lambda runs in Account A. What IAM configuration is required?",
    options: [
      "A. The Lambda execution role needs route53:AssociateVPCWithHostedZone plus sts:AssumeRole on cross-account roles in accounts B and C that have ec2:DescribeVpcs; Route53 zone association API accepts VPC IDs from any account",
      "B. Route53 hosted zone VPC associations require VPC Authorization from the VPC-owning account — the Lambda must call route53:CreateVPCAssociationAuthorization in accounts B and C (using assumed roles) before associating the VPCs",
      "C. Route53 private hosted zones cannot span multiple AWS accounts",
      "D. Use VPC peering to merge the VPCs before associating with the hosted zone"
    ],
    answer: "B",
    explanation: "Associating a Route53 private hosted zone with VPCs in OTHER accounts requires a two-step process: (1) Call CreateVPCAssociationAuthorization on the hosted zone from the zone's account, specifying the foreign VPC. (2) Call AssociateVPCWithHostedZone from the VPC's account (or with credentials that have access to that account). The Lambda must assume roles in accounts B and C to perform the authorization step, then associate. This is a frequently missed step in multi-account architectures."
  },
  {
    domain: "Configuration Management & IaC", num: 33,
    q: "A team uses AWS AppConfig for feature flags in a Lambda function. After deploying a new AppConfig configuration version with a bad value, Lambda functions across all regions start failing. The deployment was not gradual. How should AppConfig be configured to prevent this?",
    options: [
      "A. Use AppConfig validators (JSON Schema or Lambda validator) to validate configuration syntax/semantics before deployment; use a linear deployment strategy (e.g., Linear10PercentEvery1Minute) with CloudWatch alarms for automatic rollback on error rate increase",
      "B. Use AppConfig with S3 as the configuration source for automatic versioning",
      "C. Deploy AppConfig configurations during off-peak hours only",
      "D. Use AWS Parameter Store instead for safer configuration updates"
    ],
    answer: "A",
    explanation: "AppConfig provides two safety mechanisms: Validators catch bad config before deployment (JSON Schema validates structure; Lambda validators can test business logic). Deployment strategies control rollout speed — a Linear10PercentEvery1Minute strategy gradually shifts traffic to the new config. Combined with a CloudWatch alarm on Lambda errors, AppConfig automatically rolls back if the alarm triggers during the deployment window. Together, these prevent a bad config from instantly impacting all instances."
  },
  {
    domain: "Configuration Management & IaC", num: 34,
    q: "An EC2 instance running a legacy application is managed by Chef. AWS OpsWorks is being decommissioned. The team must migrate the Chef recipes to AWS Systems Manager without modifying the application. What is the migration path?",
    options: [
      "A. Rewrite all Chef recipes as SSM Automation documents",
      "B. Install the SSM Agent on the instances; use SSM Run Command with the AWS-RunChefClient document to continue executing existing Chef recipes stored in S3 or Chef Server, without any recipe modification",
      "C. Convert Chef recipes to Ansible playbooks and use SSM State Manager with Ansible",
      "D. Bake Chef recipes into a new AMI and use SSM to manage instance lifecycle only"
    ],
    answer: "B",
    explanation: "AWS Systems Manager includes the AWS-RunChefClient SSM document that executes Chef recipes on EC2 instances without any recipe modification. The instances register with SSM (not OpsWorks), and State Manager associations invoke the Chef client with existing recipes from S3 or a Chef Server. This is a lift-and-shift migration of the orchestration layer only — existing Chef recipes continue to work unchanged."
  },
  {
    domain: "Configuration Management & IaC", num: 35,
    q: "A CloudFormation stack has 200 resources. A stack update that modifies 3 resources is taking 45 minutes. Most of the time is spent on resources that aren't changing. What optimizations reduce stack update time?",
    options: [
      "A. CloudFormation updates all resources sequentially — this is expected behavior",
      "B. Break the monolithic stack into nested stacks or use CloudFormation resource imports to manage stable resources in separate stacks; updates to the parent only redeploy changed nested stacks; use --no-execute-changeset to review before applying",
      "C. Use the --change-set-name flag to limit which resources CloudFormation evaluates",
      "D. Increase the CloudFormation stack timeout"
    ],
    answer: "B",
    explanation: "CloudFormation evaluates all resources in a stack during updates but only modifies resources that differ from the template. However, dependencies between resources (DependsOn, Ref, GetAtt chains) force sequential evaluation. Breaking into nested stacks isolates changes — a parent stack update only triggers evaluation of changed nested stacks. Resources in unchanged nested stacks are not re-evaluated, reducing update scope and time significantly."
  },
  {
    domain: "Configuration Management & IaC", num: 36,
    q: "An organization needs to enforce tagging standards (required tags: CostCenter, Environment, Owner) on all new EC2 instances across all accounts. Untagged instances must be automatically tagged with a default value within 5 minutes of launch. What is the most operationally efficient implementation?",
    options: [
      "A. Use Tag Policies in AWS Organizations to enforce tags; use Config rule 'required-tags' with auto-remediation Lambda",
      "B. Use EventBridge rule matching EC2 RunInstances events across all accounts via Organizations EventBridge; trigger a Lambda that checks tags and calls ec2:CreateTags with default values for missing required tags within seconds of launch",
      "C. Use AWS Config with 'ec2-required-tags' managed rule and SSM Automation remediation",
      "D. Use Service Control Policies to deny RunInstances if required tags are missing"
    ],
    answer: "B",
    explanation: "EventBridge with Organizations event bus enables central cross-account event routing. A RunInstances CloudTrail event triggers within seconds of instance launch. The Lambda function checks for missing required tags and calls ec2:CreateTags immediately — achieving the 5-minute SLA. Config (Option C) has detection latency of minutes to hours. SCP denial (Option D) prevents launch rather than auto-tagging. Option B is fastest and most automated."
  },
  {
    domain: "Configuration Management & IaC", num: 37,
    q: "A Pulumi program manages AWS infrastructure alongside a CloudFormation stack that was deployed first. The Pulumi program needs to reference an RDS endpoint that is an output of the CloudFormation stack. How should this be implemented?",
    options: [
      "A. Export the CloudFormation stack output to SSM Parameter Store; read the parameter in the Pulumi program using the AWS SDK in the Pulumi resource constructor",
      "B. Use pulumi.StackReference to reference the CloudFormation stack outputs directly",
      "C. Use aws.cloudformation.getStack() data source in Pulumi to read the CloudFormation stack outputs at Pulumi program runtime",
      "D. Migrate the RDS resource from CloudFormation to Pulumi using pulumi import"
    ],
    answer: "C",
    explanation: "Pulumi provides aws.cloudformation.getStack() (or equivalent in each language SDK) as a data source function that reads CloudFormation stack outputs at runtime. This creates a dependency from the Pulumi stack on the CloudFormation stack's outputs without importing the resource. It's the cleanest interoperability approach — no SSM intermediary needed, and the CloudFormation stack remains unchanged."
  },
  {
    domain: "Configuration Management & IaC", num: 38,
    q: "AWS Systems Manager Patch Manager is configured to patch Windows instances during a maintenance window. After the patch run, the compliance report shows 8 instances as 'Non-Compliant: Missing Patches' even though the patch baseline approves those patches. Investigation shows the patches were installed but the report still shows non-compliant. What is the cause?",
    options: [
      "A. The instances need to be rebooted to complete patch installation — Patch Manager shows non-compliant until the pending reboot is resolved and the scan re-runs",
      "B. The patch baseline approval delay (e.g., 7 days) means newly approved patches are not yet in the baseline",
      "C. The SSM Agent needs to be updated on the affected instances",
      "D. Patch compliance data has a 24-hour reporting delay in Systems Manager"
    ],
    answer: "A",
    explanation: "Many Windows patches (especially cumulative updates and feature updates) require a system reboot to complete installation. Until the reboot occurs, the patch is in 'Installed Pending Reboot' state. Patch Manager's compliance scan detects this state as non-compliant because the patch is not fully applied. The maintenance window must include a RebootOption of 'RebootIfNeeded' in the patch baseline association, or a separate Run Command to reboot after patching."
  },
  {
    domain: "Configuration Management & IaC", num: 39,
    q: "A team uses AWS CloudFormation with a custom resource that calls an external API to provision third-party resources. The API is rate-limited to 10 calls/minute. When CloudFormation creates a stack with 50 custom resources, all 50 Lambda invocations fire simultaneously, causing API rate limit errors and custom resource failures. How is this addressed?",
    options: [
      "A. Reduce the number of custom resources in the stack",
      "B. Implement exponential backoff and retry logic in the Lambda function; use SQS with a Lambda trigger (max concurrency = 1) to serialize the API calls; the custom resource Lambda enqueues the request and polls for completion via a waiter pattern",
      "C. Add DependsOn between all custom resources to force sequential creation",
      "D. Increase the external API rate limit"
    ],
    answer: "B",
    explanation: "The SQS serialization pattern decouples CloudFormation's parallel invocations from the rate-limited API. The custom resource Lambda enqueues the provisioning request to SQS and returns a 'InProgress' status, using a CloudFormation custom resource waiter (cfnresponse with a reinvoke delay pattern). A separate SQS-triggered Lambda with reserved concurrency=1 processes requests sequentially, respecting the rate limit. This is the standard pattern for rate-limited third-party integrations with CloudFormation."
  },
  {
    domain: "Configuration Management & IaC", num: 40,
    q: "An organization uses Service Control Policies (SCPs) and has a policy denying ec2:RunInstances for all instance types except t3.* and m5.*. A developer reports they cannot launch an r5.xlarge instance in a member account even though the member account's SCP allows it. Why?",
    options: [
      "A. SCPs are additive — the member account SCP must also allow r5.xlarge",
      "B. SCPs are evaluated as an intersection (logical AND) — both the OU-level SCP (denying non t3/m5 types) AND the account-level SCP must allow the action; a deny anywhere in the hierarchy wins regardless of account-level allow",
      "C. The IAM user needs an explicit allow for r5.xlarge in their IAM policy",
      "D. SCPs only apply to IAM users, not IAM roles"
    ],
    answer: "B",
    explanation: "SCP evaluation uses a hierarchical AND model — the effective permissions are the intersection of all SCPs in the path from the root OU to the account. If any SCP in the hierarchy denies ec2:RunInstances for r5 instances (even at the Root or a parent OU), no account-level SCP can override that denial. An explicit Deny in an SCP always wins. The developer's account-level allow is irrelevant when a parent OU SCP denies the action."
  },
  {
    domain: "Configuration Management & IaC", num: 41,
    q: "A CloudFormation stack uses a Lambda-backed custom resource to rotate an external API key. The custom resource must handle Create, Update, and Delete events differently. During a stack update where only the API endpoint changed (not the Lambda code), the custom resource is unexpectedly triggering a key rotation. Why?",
    options: [
      "A. CloudFormation always triggers a custom resource update on any stack update",
      "B. The custom resource properties include the API endpoint as a property — any change to properties causes CloudFormation to send an Update event to the custom resource Lambda, which the Lambda interprets as requiring key rotation",
      "C. The Lambda function code was redeployed and CloudFormation detected the change",
      "D. Custom resources cannot distinguish between stack update types"
    ],
    answer: "B",
    explanation: "CloudFormation sends an 'Update' event to the custom resource Lambda whenever ANY property of the custom resource changes in the template — including the API endpoint. The Lambda receives the old and new property values and must implement logic to determine whether the change requires action (e.g., only rotate keys if specific properties change). The fix is to check event['OldResourceProperties'] vs event['ResourceProperties'] in the Lambda and only rotate when the relevant property actually changed."
  },
  {
    domain: "Configuration Management & IaC", num: 42,
    q: "A company manages 300 EC2 instances with SSM Fleet Manager. They need to enforce a specific NTP server configuration on all Linux instances and detect drift within 30 seconds of any manual change. What implements this most precisely?",
    options: [
      "A. SSM State Manager association running every 30 seconds",
      "B. Use SSM State Manager with a 30-minute schedule to apply the NTP config; use Amazon EventBridge + SSM Run Command for drift detection",
      "C. Use an inotify-based script on each instance that triggers SSM Run Command on config file change, combined with SSM State Manager at 30-minute intervals for baseline enforcement",
      "D. Install the Amazon CloudWatch Agent to monitor the NTP config file; use CloudWatch metric filter to detect changes; trigger SSM Automation to remediate"
    ],
    answer: "D",
    explanation: "SSM State Manager minimum schedule is 30 minutes — not suitable for 30-second drift detection. The CloudWatch Agent can tail log files and emit metrics/events on file changes. A metric filter on the monitored chrony.conf or ntp.conf file change event triggers a CloudWatch alarm immediately, which invokes SSM Automation for remediation. This achieves near-real-time drift detection (seconds) vs State Manager's minimum 30-minute schedule."
  },

  // ── DOMAIN 3: MONITORING, LOGGING & OBSERVABILITY (Q43-57) ─────────────────
  {
    domain: "Monitoring, Logging & Observability", num: 43,
    q: "An application uses X-Ray for distributed tracing. Traces show a 2-second latency spike every 5 minutes on a specific Lambda function. The CloudWatch metrics show no anomaly. The Lambda function calls DynamoDB and an external HTTP API. How do you pinpoint the exact subsegment causing the spike?",
    options: [
      "A. Enable X-Ray active tracing and filter traces by response_time > 2 in the X-Ray console; drill into the service map to identify which subsegment (DynamoDB or HTTP) shows 2s duration during spike periods",
      "B. Add CloudWatch custom metrics with millisecond timestamps to each code path",
      "C. Enable DynamoDB CloudWatch Contributor Insights to find hot keys",
      "D. Use CloudWatch ServiceLens to view the aggregated latency"
    ],
    answer: "A",
    explanation: "X-Ray captures subsegment-level timing for each downstream call (DynamoDB operations, HTTP calls, etc.) within a trace. Filtering traces by response_time > 2 seconds and examining the flame graph view shows exactly which subsegment consumes the extra time during spikes. This is the definitive tool for latency attribution in distributed systems — CloudWatch metrics only show aggregate statistics, not per-call breakdowns within a single invocation."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 44,
    q: "A team needs a CloudWatch dashboard showing real-time ECS container metrics (CPU, memory per container), ALB request rates, and RDS query latency in a single view across 3 AWS accounts. What configuration is needed?",
    options: [
      "A. Create a CloudWatch cross-account dashboard — configure CloudWatch cross-account observability (sharing accounts), create the dashboard in the monitoring account, and add widgets referencing metrics from the source accounts using account-specific metric namespaces",
      "B. Aggregate all metrics to a central account using Kinesis Firehose",
      "C. Use Amazon Managed Grafana with CloudWatch data sources from all three accounts",
      "D. Export metrics to S3 and use Athena for dashboard queries"
    ],
    answer: "A",
    explanation: "CloudWatch cross-account observability (introduced 2022) allows a central monitoring account to view metrics, logs, and traces from linked source accounts without any data replication. The monitoring account's dashboard can reference metrics from any linked source account using the account ID in the metric query. This is native, real-time, and requires no intermediate storage — purpose-built for exactly this multi-account monitoring use case."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 45,
    q: "CloudWatch Logs Insights query results show Lambda function error rates increasing, but the Lambda CloudWatch metric 'Errors' shows zero. How is this discrepancy explained?",
    options: [
      "A. Lambda Errors metric only counts invocation errors, not application-level exceptions that are caught and logged — the application is catching exceptions, logging them as ERROR, but returning HTTP 200 responses",
      "B. CloudWatch Logs Insights has a 5-minute delay vs real-time metrics",
      "C. The Lambda function is in a VPC and metrics are not exported",
      "D. Lambda metric filters are overriding the standard Errors metric"
    ],
    answer: "A",
    explanation: "Lambda's built-in 'Errors' metric counts invocations that result in a function-level error (unhandled exceptions, timeouts, out-of-memory). If the application code catches exceptions internally and logs them as ERROR-level messages but returns a successful response, the Lambda invocation is counted as successful. Logs Insights finds the logged errors; the metric doesn't. This is a critical observability gap — requiring custom metrics or structured log parsing to expose business-logic errors."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 46,
    q: "An EKS cluster's CloudWatch Container Insights is enabled but showing 'No data' for pod-level metrics after 2 hours. The CloudWatch Agent DaemonSet is running on all nodes. What should be checked?",
    options: [
      "A. The EKS node IAM role is missing CloudWatchAgentServerPolicy — the agent cannot publish metrics to CloudWatch",
      "B. Container Insights requires Amazon EKS add-on version 1.3 or higher",
      "C. The CloudWatch namespace must be manually created before metrics appear",
      "D. Pod-level metrics require Prometheus scraping, not Container Insights"
    ],
    answer: "A",
    explanation: "The CloudWatch Agent DaemonSet running on EKS nodes publishes metrics to CloudWatch using the node instance profile's IAM role. If the node IAM role lacks CloudWatchAgentServerPolicy (or equivalent permissions: cloudwatch:PutMetricData, logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents), the agent silently fails to publish. The agent appears healthy (it runs) but cannot write to CloudWatch. Always verify the node role's attached policies when Container Insights shows no data."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 47,
    q: "A team receives too many CloudWatch alarms — over 500 alerts per day, mostly noise. The alarms use static thresholds. The actual incidents that matter are only 5 per week. What CloudWatch features reduce alert fatigue while maintaining detection of real incidents?",
    options: [
      "A. Increase all alarm thresholds to reduce false positives",
      "B. Use CloudWatch Anomaly Detection alarms (ML-based dynamic thresholds that adapt to metric patterns); create Composite Alarms that combine multiple conditions with AND/OR logic to suppress noise; use alarm actions only for composite alarm state changes",
      "C. Move all alerting to Amazon DevOps Guru",
      "D. Reduce the alarm evaluation period from 1 minute to 5 minutes"
    ],
    answer: "B",
    explanation: "Two CloudWatch features address alert fatigue: (1) Anomaly Detection creates ML-based dynamic thresholds that adjust for time-of-day, day-of-week patterns — far fewer false positives than static thresholds. (2) Composite Alarms combine multiple alarms with boolean logic — requiring multiple signals to be in ALARM simultaneously before triggering a notification. This dramatically reduces noise by requiring correlated signals, not just a single threshold breach. DevOps Guru (Option C) is complementary but not a replacement for alarm rationalization."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 48,
    q: "A Kinesis Data Stream receives log data from 1000 producers. A Lambda consumer is processing records but falling behind — the GetRecords.IteratorAgeMilliseconds metric is growing. The Lambda has 5 concurrent shards. Adding more Lambda concurrency has no effect. What is the bottleneck?",
    options: [
      "A. The Kinesis stream does not have enough shards — each shard supports max 5 consumers; with 5 shards and enhanced fan-out, throughput is limited",
      "B. The Kinesis stream has insufficient shards — each Lambda function shard-consumer processes one shard; if iterator age is growing, the 5 shards cannot handle the ingestion rate; reshard the stream to add more shards OR use Kinesis Enhanced Fan-out for dedicated throughput",
      "C. The Lambda function timeout is too short — increase it to process more records per invocation",
      "D. Enable Kinesis Data Streams server-side encryption to improve throughput"
    ],
    answer: "B",
    explanation: "Kinesis Lambda consumers are bound 1:1 with shards — one Lambda invocation per shard. With 5 shards, maximum read throughput is 5 shards × 2MB/s = 10MB/s (standard) or 5 shards × 2MB/s per consumer with Enhanced Fan-out. If IteratorAgeMilliseconds grows despite full Lambda concurrency, the shards themselves are the bottleneck — either too few shards for the ingestion rate, or records too large. Resharding (adding more shards proportional to throughput need) is the solution."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 49,
    q: "An organization uses AWS Security Hub to aggregate findings from GuardDuty, Inspector, and Macie across 50 accounts. They need to automatically suppress specific Inspector findings for approved vulnerabilities in a documented risk register. How is this implemented at scale?",
    options: [
      "A. Manually archive each finding in the Security Hub console",
      "B. Use Security Hub automation rules — create rules with finding filters matching the approved CVE IDs, product ARN (Inspector), and suppression note; set action to SUPPRESSED with a note referencing the risk register ticket",
      "C. Disable Inspector for accounts that have documented risk acceptances",
      "D. Use EventBridge to filter out approved CVE findings before they reach Security Hub"
    ],
    answer: "B",
    explanation: "Security Hub Automation Rules (launched 2023) apply automated actions to findings matching filter criteria without requiring custom Lambda functions. A rule can match findings by CVE ID, Inspector ARN, severity, and other attributes, then automatically set the workflow status to SUPPRESSED with a custom note. This creates an auditable, scalable suppression mechanism tied to specific finding attributes — far better than manual archival or disabling entire services."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 50,
    q: "A Lambda function processes payment transactions and writes structured JSON logs. The team needs a real-time dashboard showing transactions per second, average transaction value, and payment failure rate, without any additional compute resources beyond Lambda. What is the most cost-effective implementation?",
    options: [
      "A. Export Lambda logs to S3 and query with Athena on a schedule",
      "B. Use CloudWatch Logs Metric Filters on the Lambda log group to extract transaction count, value (using metric value from JSON field via filter pattern [$level, $timestamp, $txn_value]), and failure count into custom CloudWatch metrics; build a CloudWatch dashboard on those metrics",
      "C. Use Kinesis Data Analytics to process the log stream in real time",
      "D. Use Amazon OpenSearch Service with Lambda log subscription"
    ],
    answer: "B",
    explanation: "CloudWatch Logs Metric Filters can extract numeric values from structured JSON logs using filter patterns with metric value extraction (e.g., { $.transaction_value = * } → metric value = $.transaction_value). This converts log data into CloudWatch metrics with no additional compute, Lambda invocations, or services. The resulting metrics feed directly into a CloudWatch dashboard with real-time updates. Zero additional infrastructure — the most cost-effective solution."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 51,
    q: "A company uses CloudTrail for audit logging. A security team member accidentally deleted a CloudTrail trail. How should the organization detect this immediately and prevent recurrence?",
    options: [
      "A. Create a CloudWatch Events (EventBridge) rule matching cloudtrail:DeleteTrail API calls from CloudTrail; alert via SNS; use an SCP to deny cloudtrail:DeleteTrail for all member accounts except the security account",
      "B. Enable Config rule 'cloud-trail-enabled' for continuous monitoring",
      "C. Use CloudTrail Insights to detect unusual trail management activity",
      "D. Replicate CloudTrail logs to S3 in a separate account with Object Lock"
    ],
    answer: "A",
    explanation: "Detection: EventBridge captures the CloudTrail management event for DeleteTrail within seconds and triggers an SNS alert. Prevention: An SCP denying cloudtrail:DeleteTrail on all member accounts means even account administrators cannot delete trails — the trail deletion would require the management account. Config (Option B) detects the absence of trails but has latency. Object Lock (Option D) protects logs but doesn't prevent trail deletion. The SCP is the preventive control."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 52,
    q: "A distributed application runs across ECS, Lambda, and API Gateway. The team needs end-to-end traces showing the complete request path from API Gateway through Lambda to ECS containers, all correlated by a single trace ID. What configuration is required?",
    options: [
      "A. Enable X-Ray active tracing on API Gateway and Lambda; install the X-Ray daemon as a sidecar in ECS tasks; instrument ECS application code with the X-Ray SDK; X-Ray automatically propagates the trace context via the X-Amzn-Trace-Id HTTP header across all services",
      "B. Use CloudWatch ServiceLens — it correlates traces without any SDK instrumentation",
      "C. Add a custom correlation ID header in API Gateway and log it in all services; query with CloudWatch Logs Insights",
      "D. Use AWS Distro for OpenTelemetry (ADOT) with X-Ray as the backend — ADOT automatically instruments all AWS services"
    ],
    answer: "A",
    explanation: "End-to-end X-Ray tracing requires: (1) API Gateway active tracing enabled — starts the trace and propagates X-Amzn-Trace-Id. (2) Lambda active tracing — Lambda intercepts the header and continues the trace. (3) ECS: X-Ray daemon sidecar + SDK instrumentation in application code to capture subsegments and forward to the daemon. The X-Amzn-Trace-Id header is the propagation mechanism. ADOT (Option D) is an alternative instrumentation layer but still requires the same underlying configuration."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 53,
    q: "An Aurora MySQL cluster's CloudWatch metrics show high database load during specific hours. The team needs to identify which specific queries are consuming the most resources without enabling the slow query log (which has performance impact). What AWS feature provides this visibility?",
    options: [
      "A. Enable Aurora Performance Insights — it captures top SQL queries by load contribution with minimal performance overhead (<1%)",
      "B. Enable RDS Enhanced Monitoring for OS-level metrics",
      "C. Use CloudWatch contributor insights on the Aurora log group",
      "D. Enable the general query log on the Aurora cluster"
    ],
    answer: "A",
    explanation: "Aurora Performance Insights is purpose-built for query-level performance analysis with stated overhead of less than 1% for most workloads. It captures average active sessions (AAS) broken down by wait events, SQL statements, hosts, and users. The Top SQL view shows which specific queries drive the load spikes without the performance cost of the general or slow query log. It operates at the database layer, not the OS layer."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 54,
    q: "A Lambda function is intermittently running out of memory (MemorySize: 512MB). The team wants to right-size it. Without changing the MemorySize, which combination of tools provides data-driven sizing recommendations?",
    options: [
      "A. Review Lambda CloudWatch metrics for max_memory_used; calculate p99 and add 20% buffer",
      "B. Use AWS Lambda Power Tuning (open-source Step Functions tool) to test the function across multiple memory configurations (128MB to 10240MB) and identify the optimal cost-performance point; supplement with Lambda Insights for memory utilization trends",
      "C. Use AWS Trusted Advisor for Lambda right-sizing recommendations",
      "D. Use Amazon DevOps Guru for Lambda anomaly detection"
    ],
    answer: "B",
    explanation: "AWS Lambda Power Tuning is the standard tool for data-driven Lambda memory optimization. It deploys a Step Functions workflow that invokes the function at multiple memory sizes simultaneously, collects duration and cost data, and outputs a visualization of the cost-performance curve. Combined with Lambda Insights (which provides per-invocation memory utilization trends), the team can identify both the safe minimum memory and the cost-optimal configuration point."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 55,
    q: "A company needs to retain all API Gateway access logs for 7 years for compliance. The current setup sends logs to CloudWatch Logs with a 90-day retention policy. What change meets the 7-year requirement at minimum cost?",
    options: [
      "A. Change the CloudWatch Logs retention policy to 7 years (2557 days)",
      "B. Keep CloudWatch Logs at 90 days for operational queries; add a CloudWatch Logs subscription filter to stream to Kinesis Data Firehose, which delivers to S3 with S3 Intelligent-Tiering; configure S3 lifecycle to transition to Glacier Deep Archive after 90 days and set a 7-year expiration",
      "C. Export CloudWatch Logs to S3 monthly using the CreateExportTask API",
      "D. Use CloudTrail data events to capture API Gateway calls instead of access logs"
    ],
    answer: "B",
    explanation: "Storing 7 years of logs in CloudWatch Logs is extremely expensive ($0.03/GB/month vs Glacier Deep Archive at $0.00099/GB/month). The tiered approach is optimal: 90 days in CloudWatch for operational query access (fast, indexed), then Kinesis Firehose streams continuously to S3, transitioning to Glacier Deep Archive for long-term retention. This meets the compliance requirement at a fraction of the cost of CloudWatch Logs-only retention."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 56,
    q: "A team deploys microservices on EKS. After a recent deployment, p99 latency increased from 50ms to 800ms. X-Ray shows the latency is in a specific service but the service's CPU and memory are normal. What should be investigated next?",
    options: [
      "A. Check the Kubernetes HPA (Horizontal Pod Autoscaler) — the service may be under-replicated",
      "B. Use X-Ray Trace Map to identify which downstream call within the slow service accounts for the latency increase; correlate with the deployment — check if a new downstream dependency, connection pool size change, or database query change was introduced",
      "C. Increase the service's memory limit to allow more JVM heap",
      "D. Check AWS Network Load Balancer health checks for the service"
    ],
    answer: "B",
    explanation: "When X-Ray isolates latency to a specific service but OS metrics are normal, the bottleneck is typically a downstream dependency within that service (a database query, external API call, or lock contention). X-Ray's trace map and trace detail view show the breakdown of time within the service — which subsegment (DB, HTTP, etc.) grew from 5ms to 750ms. Correlating with the deployment (was a new external call added? was a query changed?) pinpoints the regression."
  },
  {
    domain: "Monitoring, Logging & Observability", num: 57,
    q: "An organization needs to forward security findings from AWS Security Hub to a SIEM (Splunk) running on-premises. Findings must be near-real-time (< 1 minute delay) and include all finding metadata. What is the correct architecture?",
    options: [
      "A. Security Hub → EventBridge rule (source: aws.securityhub, detail-type: Security Hub Findings) → Kinesis Data Firehose → Splunk HTTP Event Collector (HEC)",
      "B. Security Hub → SNS → Lambda → Splunk HEC",
      "C. Security Hub → S3 export → Splunk S3 input",
      "D. Security Hub → CloudWatch Logs → Splunk CloudWatch input"
    ],
    answer: "A",
    explanation: "Security Hub emits finding events to EventBridge in near-real-time (seconds). An EventBridge rule targeting Security Hub finding events forwards to Kinesis Data Firehose, which has a native Splunk HEC destination with HTTP buffering (configurable to 60 seconds or less) and retry logic. This is the AWS-recommended integration path — Firehose handles batching, compression, retry, and the Splunk HEC connector natively. No Lambda required, reducing operational complexity."
  },

  // ── DOMAIN 4: POLICIES, STANDARDS & GOVERNANCE (Q58-68) ───────────────────
  {
    domain: "Policies, Standards & Governance", num: 58,
    q: "An organization's security policy requires that all data at rest in S3 must use KMS Customer Managed Keys (CMKs), not S3-managed keys (SSE-S3). An SCP is in place denying s3:PutObject without the condition 's3:x-amz-server-side-encryption-aws-kms-key-id'. Despite this, some objects are uploaded with SSE-S3. How?",
    options: [
      "A. SCPs don't apply to S3 PutObject operations from within the same account",
      "B. The SCP condition uses a StringEquals check but the actual header uses a different capitalization; or services assuming roles in the management account (exempt from SCPs) are uploading the objects",
      "C. S3 bucket default encryption overrides the SCP condition",
      "D. The SCP has a NotPrincipal element excluding certain IAM roles"
    ],
    answer: "B",
    explanation: "Two likely causes: (1) The SCP management account exemption — services running in the management account are not subject to SCPs. If a service or pipeline runs with management account credentials, the SCP is bypassed. (2) Condition key case sensitivity — S3 condition keys are case-sensitive in some SDK versions. Also, a bucket-level default encryption with a CMK would encrypt even without the header, potentially satisfying the intent but not the SCP condition check. Verify the principal's account and the exact condition key used."
  },
  {
    domain: "Policies, Standards & Governance", num: 59,
    q: "AWS Config is recording resource configurations. A custom Config rule evaluates EC2 instances for compliance. The rule's Lambda function is timing out for accounts with thousands of EC2 instances because it calls ec2:DescribeInstances for ALL instances in a single evaluation. How should the rule be refactored?",
    options: [
      "A. Increase the Lambda timeout to 15 minutes",
      "B. Change the rule scope to 'Configuration changes' (trigger type) on EC2 instances rather than 'Periodic' — Config invokes the Lambda with only the changed resource's configuration item (configurationItem), so the Lambda evaluates one instance at a time without needing to call DescribeInstances at all",
      "C. Use an S3-triggered batch evaluation instead of a Lambda-backed Config rule",
      "D. Split the rule into multiple rules each covering a different instance type"
    ],
    answer: "B",
    explanation: "Configuration change-triggered Config rules receive the configuration item (CI) for the specific changed resource in the Lambda event. The Lambda doesn't need to call DescribeInstances — all relevant resource attributes are in the CI payload. This eliminates the API call, removes the timeout risk, and scales infinitely. Periodic rules (which triggered the all-at-once evaluation) are appropriate only for organization-wide checks that can't be scoped to single resource changes."
  },
  {
    domain: "Policies, Standards & Governance", num: 60,
    q: "An organization uses AWS Organizations with a delegated administrator for AWS Security Hub. The security team needs to create custom Security Hub controls that apply to all accounts. Which account should host the custom controls and how are they propagated?",
    options: [
      "A. Create controls in the management account — they automatically propagate to all member accounts",
      "B. Create custom controls in the Security Hub delegated administrator account; enable cross-account aggregation; custom controls appear in all member accounts' Security Hub when the administrator enables the standard containing the custom controls",
      "C. Custom controls must be deployed individually to each member account using CloudFormation StackSets",
      "D. Security Hub does not support custom security controls — use AWS Config custom rules instead"
    ],
    answer: "B",
    explanation: "Security Hub delegated administrator has centralized management capability. Custom controls created in the administrator account can be enabled across all member accounts from the central console when using the Security Hub integration with Organizations. The delegated admin account is the authoritative source for control configuration — this is precisely why Organizations-integrated Security Hub uses a delegated admin pattern rather than the management account."
  },
  {
    domain: "Policies, Standards & Governance", num: 61,
    q: "A financial services company requires a full audit trail of all permission changes in all accounts. They need to prove that no unauthorized IAM changes occurred in the past 90 days. CloudTrail is enabled in all accounts. What additional configuration ensures the audit trail is tamper-proof?",
    options: [
      "A. Enable CloudTrail log file validation — a SHA-256 hash digest is generated for each log file; the digest chain allows detection of any file modification, deletion, or insertion after delivery",
      "B. Store CloudTrail logs in CloudWatch Logs with 90-day retention",
      "C. Enable AWS Config to record IAM resource configurations",
      "D. Use S3 Object Lock with 90-day governance mode retention on the CloudTrail bucket"
    ],
    answer: "A",
    explanation: "CloudTrail log file validation creates cryptographically signed digest files using SHA-256 hashing. Each digest contains hashes of log files and is itself signed with a private key (public key available via AWS). The validate-logs CLI command verifies the integrity of all log files and detects any modification, deletion, or insertion. Combined with S3 Object Lock (WORM) for tamper prevention, this provides both integrity proof and tamper evidence — the gold standard for financial audit trails."
  },
  {
    domain: "Policies, Standards & Governance", num: 62,
    q: "A team uses AWS Config conformance packs. After deploying a conformance pack targeting all accounts via Organizations, 15 accounts show the pack as 'CREATE_FAILED'. Investigation shows the failures are in accounts in a restricted OU that has an SCP denying config:PutConformancePack. Should the SCP be modified?",
    options: [
      "A. Yes — remove the SCP restriction to allow conformance packs in all accounts",
      "B. No — use the Organizations delegated administrator for Config to deploy conformance packs; the delegated admin assumes a service-linked role that is exempt from certain SCP restrictions for the Config service",
      "C. Deploy conformance packs from the management account which is exempt from all SCPs",
      "D. Modify the SCP to add a condition allowing conformance packs only from the Config service principal"
    ],
    answer: "D",
    explanation: "The correct solution preserves the SCP's protective intent while allowing the Config service to function. Adding an SCP condition with aws:PrincipalServiceName: config.amazonaws.com or using aws:CalledViaFirst/aws:CalledVia conditions allows the Config service itself to call PutConformancePack (when invoked via the Organizations delegation) while still blocking human/CLI access. This is the principle of least privilege applied to service-level access — not removing the SCP, but refining it."
  },
  {
    domain: "Policies, Standards & Governance", num: 63,
    q: "An IAM permission boundary is set on a developer IAM role. The boundary allows EC2 and S3 full access. The developer's IAM policy allows EC2, S3, and IAM actions. The developer tries to create an IAM role and gets an access denied error. The boundary allows iam:CreateRole. Why is the request denied?",
    options: [
      "A. IAM permission boundaries only apply to IAM users, not roles",
      "B. The developer's identity policy allows iam:CreateRole AND the boundary allows iam:CreateRole, so the action should be allowed — check if an SCP is denying the action",
      "C. Permission boundaries restrict the maximum permissions of an entity. Even if both the identity policy and boundary allow CreateRole, the boundary limits what THAT role can do — but boundary policies don't restrict IAM actions directly; check if the SCP or resource policy is the actual deny",
      "D. The boundary must explicitly allow all IAM actions in the same policy statement for CreateRole to succeed"
    ],
    answer: "B",
    explanation: "For an IAM action to be allowed, it must be permitted by BOTH the identity policy AND the permission boundary (logical AND). If both allow iam:CreateRole, the action should succeed. If it's denied despite both allowing it, an SCP in the organization hierarchy is the most likely cause — SCPs override permission boundaries and identity policies. The troubleshooting path is: verify identity policy allows it → verify boundary allows it → check SCPs → check resource policies (e.g., IAM role trust policy)."
  },
  {
    domain: "Policies, Standards & Governance", num: 64,
    q: "An organization uses AWS Control Tower with Landing Zone 3.0. A new business unit needs a custom guardrail that prevents S3 buckets from being created without a specific tag (bu-code). Control Tower's built-in guardrails don't cover this. How should this be implemented?",
    options: [
      "A. Modify an existing Control Tower guardrail to add tag checking",
      "B. Create a custom Config rule using CloudFormation StackSets that deploys to all accounts in the BU's OU; register it as a custom Control Tower control (available since Control Tower API update 2023) or use Control Tower Customizations (CfCT) to deploy it alongside standard guardrails",
      "C. Use an SCP to deny s3:CreateBucket without the required tag condition",
      "D. Use AWS Organizations Tag Policies to enforce bu-code on S3 buckets"
    ],
    answer: "B",
    explanation: "Control Tower now supports custom controls via the API (CreateControl) and through Customizations for Control Tower (CfCT). Custom Config rules deployed via CfCT or StackSets integrate into the Control Tower governance framework and appear in the Control Tower console alongside built-in guardrails. SCP (Option C) is also valid for preventive controls but doesn't integrate with Control Tower's compliance dashboard. CfCT is the recommended path for Control Tower-managed accounts."
  },
  {
    domain: "Policies, Standards & Governance", num: 65,
    q: "A company needs to enforce that EC2 instances can only use pre-approved AMIs (maintained in a specific account). Any instance launched from an unapproved AMI must be automatically terminated within 5 minutes. How is this implemented?",
    options: [
      "A. Use AWS Config rule 'approved-amis-by-id' with auto-remediation that terminates non-compliant instances",
      "B. EventBridge rule on EC2 RunInstances events → Lambda that checks AMI ID against a DynamoDB approved-list → if not approved, call ec2:TerminateInstances immediately; Config rule 'approved-amis-by-id' as a backstop for instances missed by the event",
      "C. Use an SCP denying ec2:RunInstances unless the AMI condition matches approved IDs",
      "D. Use AWS RAM to share approved AMIs and revoke access to all other AMIs"
    ],
    answer: "B",
    explanation: "EventBridge + Lambda provides near-real-time (seconds) detection and termination — meeting the 5-minute SLA. The Lambda checks the AMI ID against a DynamoDB list (maintained by the AMI governance team) and terminates immediately if not approved. Config 'approved-amis-by-id' serves as a backstop with auto-remediation for cases where the EventBridge event was missed or delayed. The SCP approach (Option C) would require hardcoding AMI IDs in SCPs — unmanageable as AMIs rotate."
  },
  {
    domain: "Policies, Standards & Governance", num: 66,
    q: "AWS IAM Access Analyzer generates a finding for an S3 bucket that is accessible from an external AWS account. Investigation shows this is an intentional cross-account data share with a trusted partner. How should this be handled in Access Analyzer without disabling the analyzer or archiving the finding manually each time?",
    options: [
      "A. Add the partner account to the Access Analyzer's Zone of Trust — findings from accounts within the zone are not generated",
      "B. Create an archive rule in the Access Analyzer that matches the specific bucket ARN and trusted account condition — findings matching the rule are automatically archived",
      "C. Disable Access Analyzer for the S3 resource type",
      "D. Use resource-based policy conditions to scope access only to the partner's VPC"
    ],
    answer: "B",
    explanation: "Access Analyzer archive rules suppress known-good findings automatically. A rule matching the specific bucket ARN and the trusted external account ID auto-archives any finding that matches this exact approved access pattern. New findings for this bucket/account combination are immediately archived without manual intervention. The Zone of Trust (Option A) suppresses all cross-account findings from trusted accounts — too broad if you only want to suppress specific resources."
  },
  {
    domain: "Policies, Standards & Governance", num: 67,
    q: "A compliance requirement states that all AWS API calls must be logged, CloudTrail cannot be disabled, and log integrity must be provable. An audit finds that a malicious insider disabled CloudTrail for 2 hours. What combination of controls prevents this in the future?",
    options: [
      "A. SCP denying cloudtrail:StopLogging and cloudtrail:DeleteTrail for all roles except the security-break-glass role; S3 Object Lock (compliance mode) on the CloudTrail log bucket; CloudTrail log file validation enabled; EventBridge alert on StopLogging API calls",
      "B. Enable AWS Config rule 'cloud-trail-enabled' with auto-remediation",
      "C. Require MFA for all CloudTrail management actions using IAM condition keys",
      "D. Use CloudTrail Insights to detect unusual API activity patterns"
    ],
    answer: "A",
    explanation: "Defense in depth: (1) SCP preventing StopLogging/DeleteTrail blocks the action at the organization level — cannot be overridden by account-level policies. (2) S3 Object Lock (compliance mode) means even if CloudTrail is stopped, existing logs cannot be deleted or modified — tamper-proof for compliance. (3) Log file validation proves integrity of what was captured. (4) EventBridge alert provides immediate notification if someone attempts the action (even if blocked by SCP, the attempt is logged). Together, these address prevention, integrity, and detection."
  },
  {
    domain: "Policies, Standards & Governance", num: 68,
    q: "A company uses AWS Organizations and needs to generate a report showing all AWS resources across all accounts that don't have a specific cost allocation tag (project-id). The report must be updated daily. What is the most scalable approach?",
    options: [
      "A. Use AWS Config aggregator across all accounts; query with Config advanced queries (SELECT configuration WHERE tags NOT LIKE '%project-id%') to find untagged resources; export query results to S3 daily via Lambda",
      "B. Enable Cost Explorer tag compliance report",
      "C. Write a Lambda that iterates through all accounts using Organizations API and calls describe/list APIs for each resource type",
      "D. Use AWS Trusted Advisor tag compliance check"
    ],
    answer: "A",
    explanation: "AWS Config aggregator consolidates configuration data from all accounts in an Organization into a single query endpoint. Config advanced queries (SQL-like SELECT syntax) can query resource configurations including tags across all aggregated accounts in seconds. A scheduled Lambda runs the query daily, exports results to S3, and optionally emails a report. This is far more scalable than iterating through resource-type APIs per account (Option C), which hits API limits and requires maintaining resource-type coverage as AWS adds new services."
  },

  // ── DOMAIN 5: HIGH AVAILABILITY & DR (Q69-83) ──────────────────────────────
  {
    domain: "High Availability & Disaster Recovery", num: 69,
    q: "An application runs on ECS Fargate with an Aurora Global Database. The RTO is 5 minutes and RPO is 15 seconds. A region-wide outage in us-east-1 occurs. What is the correct failover sequence?",
    options: [
      "A. Promote the Aurora secondary cluster in us-west-2 (Global Database failover ~1 minute); update ECS service task definition environment variable for DB endpoint; update Route53 record to point to us-west-2 ALB; ECS tasks restart with new DB endpoint",
      "B. Use Aurora failover API to promote the secondary; ECS auto-detects the new endpoint",
      "C. Initiate Aurora managed planned failover; Route53 health check automatically switches to us-west-2",
      "D. Restore Aurora from automated backup in us-west-2; redirect traffic"
    ],
    answer: "A",
    explanation: "Aurora Global Database failover (remove region and promote secondary) takes approximately 1 minute — well within RPO of 15 seconds for data replication lag. The sequence is: (1) Remove us-east-1 from Global Database and promote us-west-2 to primary (RDS API). (2) The ECS Fargate tasks must be updated to connect to the new Aurora writer endpoint — this requires updating the task definition or using parameter-based discovery (SSM/Secrets Manager). (3) Route53 health check failover handles traffic. Pre-automation of steps 2-3 via runbooks or Step Functions is required for RTO compliance."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 70,
    q: "A company has an RTO of 1 hour and RPO of 4 hours for a non-critical batch processing application on EC2 with S3 data storage. They want the lowest possible DR cost. Which strategy is appropriate?",
    options: [
      "A. Pilot Light with EC2 AMIs in the DR region and S3 cross-region replication",
      "B. Backup and Restore — S3 cross-region replication for near-real-time data sync; automated AMI backups every 4 hours via AWS Backup; CloudFormation template for full environment rebuild in DR region; can rebuild within 1 hour",
      "C. Warm Standby with scaled-down EC2 instances always running in DR region",
      "D. Multi-site active-active"
    ],
    answer: "B",
    explanation: "For RTO 1 hour / RPO 4 hours, Backup and Restore is the most cost-effective: S3 cross-region replication ensures data is continuously synced (RPO ~seconds for new objects). EC2 AMI backups every 4 hours satisfy the RPO. A pre-tested CloudFormation template can rebuild the compute environment within 1 hour when triggered. No compute runs in the DR region between disasters — maximum cost savings. Pilot Light (Option A) keeps minimal compute running — unnecessary for a 1-hour RTO."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 71,
    q: "An application uses SQS queues extensively. During a regional failover, messages in the primary region's SQS queues must not be lost. The DR region has a parallel SQS queue. How can messages be preserved during failover?",
    options: [
      "A. Enable SQS cross-region replication — SQS natively replicates messages to the DR region queue",
      "B. SQS does not natively replicate across regions. Messages in-flight during failover will be lost unless: producers are switched to write to both queues simultaneously (fan-out), or an EventBridge Pipe replicates messages from primary to DR queue in near-real-time, or the application uses SQS FIFO with DLQ and the DLQ messages are drained to the DR queue post-failover",
      "C. Use SQS message retention (max 14 days) — messages stay in primary region queue; redirect consumers to primary region after it recovers",
      "D. Use Kinesis instead of SQS for automatic multi-region replication"
    ],
    answer: "B",
    explanation: "SQS has no native cross-region replication. Messages in primary region queues during a regional failure are inaccessible until the region recovers — not lost (SQS retains up to 14 days) but not available during outage. The options to achieve cross-region durability are: (1) Dual-write: producers write to both regions (adds latency/complexity). (2) EventBridge Pipe with SQS source → cross-region target for async replication. (3) Accept message unavailability during regional outage (appropriate for non-critical workloads). There's no zero-cost solution for cross-region SQS message availability."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 72,
    q: "A company conducts quarterly DR drills. During the drill, failing over to the DR region reveals the application cannot connect to AWS services because VPC endpoint configurations weren't replicated to the DR region. How should this be prevented?",
    options: [
      "A. Manually configure VPC endpoints in the DR region before each drill",
      "B. Use CloudFormation with the same template deployed to both regions via CodePipeline; the pipeline deploys infrastructure changes to both regions simultaneously, ensuring DR region configuration always mirrors primary",
      "C. Use AWS Global Accelerator to route around missing VPC endpoints",
      "D. Document VPC endpoint requirements in the runbook and configure manually during failover"
    ],
    answer: "B",
    explanation: "Infrastructure drift between primary and DR regions is the most common DR failure mode. The fix is infrastructure-as-code deployed simultaneously to both regions by the same pipeline. Any CloudFormation template change triggers deployment to primary AND DR region in the same pipeline execution. This guarantees configuration parity at all times. DR drills then validate behavior, not configuration — eliminating the class of failures caused by undocumented manual configurations in the primary region."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 73,
    q: "An application uses DynamoDB Global Tables for multi-region active-active with regions us-east-1 and eu-west-1. A developer accidentally deletes 10,000 items in us-east-1. Due to Global Tables replication, the deletions propagate to eu-west-1 within seconds. How can the data be recovered?",
    options: [
      "A. DynamoDB Global Tables maintains a separate replica that is not affected by deletions — restore from the unaffected region",
      "B. Use DynamoDB Point-in-Time Recovery (PITR) to restore the table to a point before the deletions — PITR must be enabled on the Global Table; restore to a new table, identify deleted items by comparing with current state, and selectively restore them",
      "C. Contact AWS Support to recover data from Global Tables replication log",
      "D. Restore from an AWS Backup vault copy taken before the deletions"
    ],
    answer: "B",
    explanation: "DynamoDB Global Tables replication is bidirectional and propagates all mutations (including deletions) to all replica regions. There is no 'clean' replica — all regions have the same deletions. PITR (if enabled) allows table restoration to any second within the past 35 days. Restoring to a new table at T-5 minutes provides the data before deletion. The selective restore approach avoids overwriting valid updates that occurred between the recovery point and now. PITR must be proactively enabled — it's not retroactive."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 74,
    q: "An organization uses AWS Elastic Disaster Recovery (DRS) to replicate on-premises servers to AWS. During a drill, the launched DR instances in AWS cannot reach the application database because the database is still on-premises and the VPN is simulated as down. How should the DR architecture address this?",
    options: [
      "A. Use DRS launch settings to configure post-launch scripts that update the application database connection string to point to an RDS replica in AWS",
      "B. Include the on-premises database server in the DRS replication scope — replicate database servers to AWS as well; during failover, both application and database servers launch in AWS with RDS or EC2 as target",
      "C. Keep a continuously updated RDS Read Replica synchronized from on-premises via DMS CDC; DRS launch settings configure the application to use the RDS endpoint; promote the read replica on failover",
      "D. Both B and C are valid DR architectures depending on database technology and RPO requirements"
    ],
    answer: "D",
    explanation: "Both approaches are valid and used in production: Option B (DRS for database servers) works for any database but requires database startup/recovery procedures in the launch settings. Option C (DMS CDC + RDS replica) is cleaner for managed database scenarios, providing lower RPO and managed failover. The best choice depends on the database type (Oracle vs MySQL vs SQL Server) and the required RPO. DRS alone replicates the server but not the network dependencies — database replication strategy must be explicit."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 75,
    q: "A high-frequency trading application requires sub-millisecond failover with zero data loss. The application runs on EC2 with a custom in-memory state store. What AWS architecture best approaches these requirements?",
    options: [
      "A. Multi-AZ EC2 with ElastiCache Redis Cluster Mode for state replication",
      "B. EC2 instances in multiple AZs with synchronous state replication using ElastiCache for Redis with Cluster Mode enabled and Multi-AZ; use EC2 with placement groups (cluster) for network performance; Network Load Balancer with cross-zone load balancing and health check interval of 10 seconds for fast failover; application-level leader election using Redis distributed locks",
      "C. EC2 with EBS Multi-Attach for shared state storage with automatic failover",
      "D. AWS outposts with local zone deployment for microsecond latency"
    ],
    answer: "B",
    explanation: "Sub-millisecond failover requirements push against the limits of what cloud infrastructure can guarantee, but the closest architecture is: synchronous state replication across AZs (ElastiCache Redis with replication), fast health check detection (NLB minimum 10-second interval), and application-level leader election to avoid split-brain. EBS Multi-Attach (Option C) is not appropriate for state stores — it requires careful application-level coordination and isn't designed for automatic failover. True sub-ms zero-data-loss requires application-level synchronous replication."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 76,
    q: "An organization tests DR runbooks quarterly. Each drill requires 4 hours of engineering time to follow manual steps. The business wants to reduce drill time to 30 minutes and make drills more frequent. How should this be automated?",
    options: [
      "A. Document runbooks more clearly to reduce execution time",
      "B. Implement AWS Systems Manager Automation documents for each DR step; orchestrate the full failover sequence with Step Functions; run drills by triggering the Step Functions execution; integrate with CloudWatch for automated health validation post-failover",
      "C. Use AWS Resilience Hub to generate and execute DR runbooks automatically",
      "D. Hire more engineers to parallelize manual drill execution"
    ],
    answer: "B",
    explanation: "Converting manual runbooks to SSM Automation documents and orchestrating them with Step Functions transforms a 4-hour manual process into a button-press. Step Functions provides visual execution tracking, retry logic, branching based on health check results, and parallel execution of independent steps. AWS Resilience Hub (Option C) provides resiliency assessments and recommendations but doesn't execute DR procedures. The automation also enables chaos engineering — triggering planned failovers more frequently with confidence."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 77,
    q: "An application behind an ALB in us-east-1 needs to failover to us-west-2 using Route53. The team uses a Failover routing policy with health checks. After a real incident, traffic didn't failover for 8 minutes. The health check interval was 30 seconds with a 3-failure threshold. How can failover time be reduced to under 2 minutes?",
    options: [
      "A. Reduce the Route53 health check interval to 10 seconds (fast health check) with a failure threshold of 2; this reduces detection time to 20 seconds; add DNS TTL optimization on the failover records",
      "B. Reduce the Route53 TTL to 0 seconds",
      "C. Use Global Accelerator instead — it performs health checks at the network layer with 30-second failover",
      "D. Use CloudWatch alarm-based Route53 health checks for faster detection"
    ],
    answer: "A",
    explanation: "Route53 fast health checks (10-second interval) reduce detection time dramatically. With 10-second intervals and threshold=2, total detection = 20 seconds. However, DNS TTL also contributes to failover time — if the primary record has a 5-minute TTL, resolvers cache it for up to 5 minutes after the health check detects failure. Setting the failover record TTL to 60 seconds keeps total failover under 2 minutes (20s detection + 60s TTL propagation). Global Accelerator (Option C) also achieves fast failover but requires additional cost and architecture change."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 78,
    q: "A company's EKS cluster has 3 node groups across 3 AZs. A deployment causes all pods to schedule on nodes in a single AZ due to a Kubernetes affinity rule misconfiguration. A single AZ outage takes down the entire application. What should be implemented to prevent this?",
    options: [
      "A. Use Kubernetes Pod Disruption Budgets to prevent pod evictions",
      "B. Use Kubernetes topology spread constraints (topologySpreadConstraints) with topologyKey: topology.kubernetes.io/zone and maxSkew: 1 to enforce even pod distribution across AZs; remove conflicting affinity rules",
      "C. Use Cluster Autoscaler to add nodes in the affected AZ automatically",
      "D. Use EKS managed node groups with automatic scaling"
    ],
    answer: "B",
    explanation: "Kubernetes topology spread constraints are the native mechanism to enforce pod distribution across AZs. maxSkew: 1 means the difference in pod count between any two zones cannot exceed 1. If combined with whenUnsatisfiable: DoNotSchedule, new pods won't schedule in over-represented zones. This forces rebalancing and prevents the single-AZ concentration that caused the outage. Pod Disruption Budgets (Option A) prevent disruptions during voluntary events but don't control scheduling placement."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 79,
    q: "A company uses AWS Backup to back up RDS, EFS, and DynamoDB. The backup vault is in us-east-1. How should backups be configured to protect against a complete us-east-1 regional failure, including the backup vault?",
    options: [
      "A. Enable S3 cross-region replication on the backup vault",
      "B. Use AWS Backup Vault Lock to protect existing backups; create a Backup Plan with cross-region copy actions that copy backups to a vault in us-west-2 as part of every backup job",
      "C. AWS Backup vaults are globally replicated by default",
      "D. Use AWS DataSync to replicate backup data to a second region"
    ],
    answer: "B",
    explanation: "AWS Backup Plans support cross-region copy actions natively — every backup job can automatically copy the recovery point to a vault in another region. This creates a geo-redundant backup. The destination region vault should also have Vault Lock (WORM) enabled to prevent backup deletion by malicious actors or accidental deletion. This is the standard multi-region resilience pattern for AWS Backup. The primary vault is inaccessible during a regional outage, but the cross-region copy remains available."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 80,
    q: "A team practices chaos engineering using AWS Fault Injection Service (FIS). An experiment injects network latency into an ECS service's outbound connections. The application fails in unexpected ways during the experiment — pods crash instead of degrading gracefully. What AWS FIS safety mechanism should be used and what application fix is needed?",
    options: [
      "A. FIS Stop Conditions: configure a CloudWatch alarm on ECS task failure rate as a stop condition; FIS automatically stops the experiment when the alarm triggers, preventing runaway failures. Application fix: implement circuit breakers and fallback logic for external dependency failures",
      "B. Run FIS experiments only in development environments",
      "C. Reduce FIS experiment duration to 1 minute",
      "D. Use FIS with a rollback action to restore original network configuration"
    ],
    answer: "A",
    explanation: "FIS Stop Conditions are safety guardrails — a CloudWatch alarm (e.g., on task failure rate > 10%) automatically halts the experiment before it causes a broader outage. This allows experiments to proceed until something real breaks, then stops automatically. The application fix revealed by the experiment (crashes instead of graceful degradation) requires implementing resilience patterns: circuit breakers (Resilience4j, Hystrix patterns), timeout handling, and fallback responses. Chaos engineering's value is precisely identifying these gaps before they become production incidents."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 81,
    q: "An organization's compliance requires that production databases in RDS have automated backups with a minimum 30-day retention and that no backups can be deleted for 30 days. AWS Backup is in use. How is the 'no deletion for 30 days' requirement enforced?",
    options: [
      "A. Set the AWS Backup retention period to 30 days",
      "B. Enable AWS Backup Vault Lock (compliance mode) with a minimum retention of 30 days on the backup vault; Vault Lock prevents deletion of any recovery point within the lock period even by the root account",
      "C. Use IAM policies to deny backup:DeleteRecoveryPoint for all roles",
      "D. Use S3 Object Lock on the backup storage bucket"
    ],
    answer: "B",
    explanation: "AWS Backup Vault Lock in compliance mode creates a WORM (Write Once Read Many) configuration for the vault. Once applied, no one — including the AWS root account — can delete recovery points before the minimum retention period expires or modify the Vault Lock settings. This satisfies regulatory compliance requirements that require immutable backup retention. IAM policies (Option C) can be modified by privileged users and don't provide the same legal-grade immutability as Vault Lock compliance mode."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 82,
    q: "A multi-tier application has an Auto Scaling group for the web tier and a fixed-capacity fleet for the application tier. During peak load, the web tier scales out correctly but the application tier becomes the bottleneck. The operations team doesn't want Auto Scaling on the application tier due to stateful sessions. What architecture best handles this without Auto Scaling on the app tier?",
    options: [
      "A. Add more instances permanently to the app tier to handle peak load",
      "B. Migrate application session state from in-memory to ElastiCache (Redis); once the app tier is stateless, enable Auto Scaling with lifecycle hooks to handle session drain; OR increase app tier capacity using Scheduled Scaling based on known traffic patterns",
      "C. Use Elastic Load Balancing connection draining to manage app tier capacity",
      "D. Use SQS to queue requests to the app tier during overload"
    ],
    answer: "B",
    explanation: "The real solution is addressing the root cause: stateful sessions prevent Auto Scaling. Externalizing session state to ElastiCache makes the app tier stateless and Auto Scaling-eligible. With lifecycle hooks (ALB deregistration + session drain), scale-in is safe. If session migration is not feasible short-term, scheduled scaling based on traffic patterns provides predictive capacity without reactive Auto Scaling — pre-scaling before expected peaks. SQS (Option D) decouples but adds significant latency not appropriate for synchronous web requests."
  },
  {
    domain: "High Availability & Disaster Recovery", num: 83,
    q: "AWS Resilience Hub is used to assess an application's resiliency. The assessment reports RTO = 45 minutes and RPO = 2 hours against targets of RTO = 15 minutes and RPO = 30 minutes. The application bottleneck is identified as 'RDS database recovery time'. What changes most effectively close the gap?",
    options: [
      "A. Enable RDS Multi-AZ for automatic failover (~60-120 seconds vs manual restore); enable automated backups with 5-minute backup window; use RDS Proxy to reduce connection overhead during failover; these together bring RTO well under 15 minutes",
      "B. Increase RDS instance size for faster restore",
      "C. Take more frequent RDS snapshots",
      "D. Use RDS read replicas as standby instances"
    ],
    answer: "A",
    explanation: "RDS Multi-AZ provides automatic failover to the standby in 60-120 seconds — transforming a 45-minute manual restore into a 2-minute automatic failover. RDS Proxy maintains connection pooling and reconnects application connections to the new primary after failover, reducing the application-side recovery time. For RPO, Multi-AZ provides synchronous replication with near-zero data loss. This combination directly addresses both gaps identified by Resilience Hub. Read replicas (Option D) require manual promotion — not automatic failover."
  },

  // ── DOMAIN 6: INCIDENT & EVENT RESPONSE (Q84-100) ──────────────────────────
  {
    domain: "Incident & Event Response", num: 84,
    q: "Amazon GuardDuty generates a finding: 'Behavior:EC2/NetworkPortUnusual'. An EC2 instance is making outbound connections on port 4444 (common Metasploit reverse shell port). The instance is in an Auto Scaling group. What is the correct incident response that balances evidence preservation with blast radius containment?",
    options: [
      "A. Terminate the instance immediately — Auto Scaling will replace it",
      "B. (1) Remove the instance from the Auto Scaling group (detach, don't decrement desired); (2) Isolate it by replacing its security group with a forensics SG allowing only SSM and no outbound; (3) Take EBS volume snapshot; (4) Use SSM to capture running processes and memory; (5) Terminate only after forensics complete; (6) Suspend ASG termination policy during investigation",
      "C. Stop the instance and mount the EBS volume on a forensic instance",
      "D. Rotate all IAM credentials associated with the instance role immediately"
    ],
    answer: "B",
    explanation: "The correct IR sequence: Contain (isolate network without terminating — evidence preserved), Preserve (EBS snapshot, memory capture via SSM Run Command with volatility/LiME tools), Investigate (analyze process list, network connections, file system changes), Eradicate (terminate instance, deploy clean replacement). Detaching from the ASG prevents Auto Scaling from terminating it or treating it as unhealthy. The forensics security group prevents command-and-control while allowing SSM access for investigation. Immediate termination (Option A) destroys all forensic evidence."
  },
  {
    domain: "Incident & Event Response", num: 85,
    q: "An AWS Lambda function's concurrency limit has been hit and the function is throttling. The function processes customer orders. EventBridge triggers Lambda directly. Orders during throttling are being silently dropped. How is this resolved with zero order loss?",
    options: [
      "A. Increase Lambda concurrency limit",
      "B. Add an SQS queue between EventBridge and Lambda (EventBridge → SQS → Lambda trigger); SQS buffers events during throttling; Lambda processes them when concurrency is available; set message retention to 14 days and DLQ for failures",
      "C. Use Lambda reserved concurrency to guarantee capacity for this function",
      "D. Switch Lambda trigger to SNS which has built-in retry"
    ],
    answer: "B",
    explanation: "EventBridge direct Lambda invocations are synchronous fire-and-forget — if Lambda is throttled, the event is retried only twice with exponential backoff then dropped. SQS as a buffer decouples the ingestion rate from the processing rate. SQS retains messages for up to 14 days, Lambda processes them when capacity is available, and a DLQ captures poison messages for investigation. This is the standard pattern for decoupling event producers from rate-limited consumers in AWS. SNS (Option D) also retries but for a shorter window."
  },
  {
    domain: "Incident & Event Response", num: 86,
    q: "A production RDS PostgreSQL database is experiencing severe performance degradation. CloudWatch shows CPU at 95%, IO at maximum, and connection count at the maximum allowed. The application cannot be taken down. What are the immediate actions in order of priority?",
    options: [
      "A. (1) Enable RDS Proxy to manage connection pooling and immediately drop idle connections; (2) Use pg_stat_activity to identify and terminate runaway queries (SELECT pg_terminate_backend(pid)); (3) Enable Performance Insights if not on to identify top SQL; (4) Consider a manual scale-up of the instance class during incident window",
      "B. Take an RDS snapshot and restore to a larger instance class",
      "C. Enable Multi-AZ and failover to the standby",
      "D. Increase max_connections parameter in the parameter group"
    ],
    answer: "A",
    explanation: "The ordered response: (1) RDS Proxy is the fastest connection relief — it can be attached to an existing RDS instance and immediately pools/multiplexes connections, buying time. (2) Terminate runaway queries using pg_terminate_backend — directly addresses CPU/IO if a long-running query is the cause. (3) Performance Insights pinpoints the specific query causing the load. (4) Instance scale-up requires a reboot window but can be done via the console. Increasing max_connections (Option D) worsens the problem — more connections increase memory pressure and context switching."
  },
  {
    domain: "Incident & Event Response", num: 87,
    q: "An S3 bucket containing sensitive data has a bucket policy that was accidentally made public. The bucket is used by Lambda functions and ECS tasks in the same account. Within seconds of discovery, what actions minimize data exposure while maintaining application availability?",
    options: [
      "A. Delete the bucket policy",
      "B. (1) Enable S3 Block Public Access at the ACCOUNT level immediately — this overrides any bucket policy public grants instantly without modifying the policy; (2) Review CloudTrail S3 data events to identify any external access that occurred; (3) After verifying application still works with Block Public Access enabled, review and fix the specific bucket policy statement",
      "C. Enable S3 Object Lock on the bucket",
      "D. Rotate the encryption keys for the bucket"
    ],
    answer: "B",
    explanation: "S3 Block Public Access account-level setting is the fastest, most effective containment action — it takes effect within seconds and overrides any bucket policy public grants without requiring bucket policy modification (which could cause application disruption if done incorrectly). Internal applications (Lambda, ECS with IAM roles) use identity-based credentials, not public access — they continue to work after Block Public Access is enabled. CloudTrail S3 data events provide the exposure timeline. The policy fix follows after containment."
  },
  {
    domain: "Incident & Event Response", num: 88,
    q: "A CloudFormation stack delete operation is stuck in DELETE_FAILED state because an S3 bucket in the stack is not empty. The bucket contains 2 million objects. The team needs to delete the stack quickly. What is the most efficient approach?",
    options: [
      "A. Manually empty the bucket using the S3 console and retry stack deletion",
      "B. Use aws s3 rb s3://bucket-name --force in CLI (which empties and deletes in one command); then retry stack deletion; OR retain the bucket by modifying the resource DeletionPolicy to Retain, update the stack, then delete the stack (bucket stays) and delete bucket separately",
      "C. Add a CloudFormation custom resource that empties the bucket before deletion",
      "D. Delete the stack with --retain-resources flag specifying the S3 bucket"
    ],
    answer: "D",
    explanation: "--retain-resources flag on delete-stack is the fastest path: CloudFormation skips the bucket deletion and removes it from the stack, allowing the stack to successfully delete all other resources. The bucket remains in the account and can be emptied and deleted independently at any time. aws s3 rb --force (Option B) works but sequentially deleting 2 million objects takes significant time. A custom resource (Option C) adds complexity and requires a stack update first."
  },
  {
    domain: "Incident & Event Response", num: 89,
    q: "An AWS account shows unexpected charges of $50,000 in a single day. The charges are from EC2 instances in a region the company never uses (ap-southeast-1). GuardDuty was not enabled. What is the immediate response sequence?",
    options: [
      "A. Open an AWS Support case and wait for investigation",
      "B. (1) Identify the IAM principal that launched the instances using CloudTrail (filter for RunInstances in ap-southeast-1); (2) Immediately disable or delete the compromised IAM key/role; (3) Terminate all unauthorized EC2 instances; (4) Enable GuardDuty and Security Hub in ALL regions; (5) Rotate all IAM access keys; (6) Review all other regions for similar activity; (7) Contact AWS Support for billing credit and incident assistance",
      "C. Terminate only the EC2 instances — the charges will stop",
      "D. Enable SCPs to deny EC2 actions in all unused regions"
    ],
    answer: "B",
    explanation: "Cryptomining attacks follow a pattern: stolen IAM credentials → launch high-CPU instances in unexpected regions. The ordered response: Stop the bleeding (disable compromised credentials immediately), Terminate unauthorized resources (stop further charges), Investigate scope (all regions, not just the one discovered), Harden (GuardDuty everywhere, SCPs restricting unused regions, key rotation), Recover (AWS billing credit for security events — contact Support within 24 hours). Disabling credentials before terminating instances prevents the attacker from relaunching. SCPs (Option D) are important post-incident hardening but not the immediate priority."
  },
  {
    domain: "Incident & Event Response", num: 90,
    q: "A company uses Amazon EventBridge for event routing. A new event rule was deployed that accidentally matches a superset of intended events, causing thousands of unwanted Lambda invocations per minute. The Lambda is idempotent but the cost is significant. How is this resolved without service disruption?",
    options: [
      "A. Disable the EventBridge rule immediately, fix the event pattern, re-enable",
      "B. (1) Disable the misconfigured EventBridge rule immediately (no events dropped — events not matched by any rule are simply not routed); (2) Fix the event pattern in a test environment, validate with EventBridge's 'Test event pattern' feature; (3) Re-enable the corrected rule; since Lambda is idempotent, the unwanted invocations caused no data corruption — only cost impact",
      "C. Add a Lambda concurrency limit to throttle the unwanted invocations",
      "D. Remove the Lambda target from the rule and add an SQS target to buffer events"
    ],
    answer: "B",
    explanation: "Disabling an EventBridge rule is instantaneous and non-destructive — events that don't match any rule are simply discarded, no backlog builds up. The fix is then tested using EventBridge's built-in 'Test event pattern' feature (send a sample event JSON and verify only intended events match). Since Lambda is idempotent, the incident caused only cost impact, not data corruption — the priority is stopping the cost bleed, not data recovery. EventBridge's test feature is specifically designed to validate event patterns before deployment."
  },
  {
    domain: "Incident & Event Response", num: 91,
    q: "A DynamoDB table has hot partitions causing throttling. The table uses a composite primary key with partition key 'region' (3 possible values) and sort key 'timestamp'. 80% of writes go to 'us-east-1' partition. The table is in on-demand mode. What architectural changes resolve the hot partition?",
    options: [
      "A. Switch from on-demand to provisioned capacity with Auto Scaling",
      "B. Implement write sharding: append a random suffix (0-N) to the partition key (e.g., 'us-east-1#3'); distribute writes across N logical partitions; aggregate read results across all shards in application code OR use DAX for read amplification reduction",
      "C. Use DynamoDB Streams to offload write pressure",
      "D. Increase the DynamoDB table's WCU limit by contacting AWS Support"
    ],
    answer: "B",
    explanation: "DynamoDB hot partitions occur when a single partition key value receives disproportionate traffic. On-demand mode helps with burst capacity but cannot overcome hot partition concentration — DynamoDB distributes load by partition key, and a single key value maps to a single partition. Write sharding distributes writes across multiple physical partitions by adding a shard suffix to the key. Reads require querying all shards (parallelized) and merging results. This is the canonical DynamoDB anti-hot-partition pattern."
  },
  {
    domain: "Incident & Event Response", num: 92,
    q: "A production EKS deployment using a rolling update strategy is causing intermittent 503 errors from the ALB. New pods start returning 200s but old pods haven't been terminated yet. Analysis shows the 503s occur when ALB routes to new pods that haven't completed initialization. What Kubernetes configuration fixes this?",
    options: [
      "A. Increase the ALB health check threshold to prevent pods from receiving traffic before ready",
      "B. Configure readinessProbe on the container with appropriate initialDelaySeconds, periodSeconds, and successThreshold — ALB (via AWS Load Balancer Controller) only adds a pod to the target group after its readiness probe succeeds; configure preStop lifecycle hook with sleep to allow connection draining before pod termination",
      "C. Use a Recreate deployment strategy instead of RollingUpdate",
      "D. Increase the minReadySeconds in the deployment spec"
    ],
    answer: "B",
    explanation: "Two root causes require two fixes: (1) New pods receiving traffic before ready: readinessProbe ensures ALB only registers a pod in the target group after the application is ready to serve traffic. Without readinessProbe, ALB registers pods immediately after container start. (2) Connection drops during old pod termination: the preStop hook (sleep 5-10 seconds) allows the ALB to deregister the pod and drain connections before SIGTERM kills the process. Together these eliminate the 503s from both sides of the rolling update."
  },
  {
    domain: "Incident & Event Response", num: 93,
    q: "AWS CloudTrail shows API calls being made from an IAM role at 3 AM (UTC) every day, performing data enumeration (ListBuckets, ListObjects, DescribeInstances) across all regions. The calls originate from an IP address not in the company's known IP range. No scheduled jobs are configured for this role. What is the likely threat and response?",
    options: [
      "A. A developer in a different timezone is working unusual hours — investigate before acting",
      "B. This pattern indicates a compromised IAM role being used by a threat actor for reconnaissance. Response: (1) Immediately revoke all active sessions for the role using sts:GetCallerIdentity to identify session tokens, then apply a zero-permission inline policy (JSON: {Effect:Deny, Action:*, Resource:*}) to the role as an emergency brake; (2) Investigate how the role was compromised (leaked access key? EC2 instance metadata SSRF?); (3) Create a new clean role; (4) Enable GuardDuty if not enabled",
      "C. Rotate the access key associated with the role",
      "D. Add an IP-based condition to the role's trust policy"
    ],
    answer: "B",
    explanation: "The pattern (scheduled time, non-company IP, cross-region enumeration) is textbook credential compromise with automated exfiltration tooling. Rotating the access key (Option C) is insufficient for IAM roles — roles don't use long-term access keys (they use STS temporary credentials). The emergency brake technique attaches a deny-all inline policy to the role, immediately invalidating all current session tokens and preventing new ones from having any permissions. Then investigate the root cause (common: Lambda or EC2 with the role had SSRF or code injection vulnerability)."
  },
  {
    domain: "Incident & Event Response", num: 94,
    q: "An application team deploys a new version that causes a database schema migration on startup. The migration takes 4 minutes. During this time, old pods (pointing to old schema) and new pods (running migration) coexist, causing data corruption. How should this be handled in the deployment process?",
    options: [
      "A. Increase the deployment rolling update maxSurge to ensure new pods come up faster",
      "B. Implement expand-contract (parallel change) migrations: (1) Expand: deploy schema changes that are backward compatible with old code (add column with default, don't remove old column); (2) Deploy new application code that works with both schemas; (3) Contract: after full rollout, deploy migration to remove old schema elements; schema migrations run as Kubernetes Jobs or init containers, not as application startup code",
      "C. Use a maintenance window to take down the application during schema migration",
      "D. Run schema migrations as part of CodeBuild before the deployment starts"
    ],
    answer: "B",
    explanation: "Schema migrations during rolling deployments require backward-compatible changes. The expand-contract pattern: Expand phase adds new columns/tables without removing old ones (old code still works). The new application code handles both old and new schemas. Contract phase removes deprecated schema after 100% rollout. Migration logic should run as a Kubernetes Job (not application init) so it runs once, not on every pod startup. This eliminates the old-code/new-schema coexistence problem entirely."
  },
  {
    domain: "Incident & Event Response", num: 95,
    q: "An Auto Scaling group in an ECS cluster is scaling out rapidly due to a sudden traffic spike. New EC2 instances are launching but ECS tasks are not starting on them. CloudWatch shows ecs:RegisterContainerInstance succeeding. What is the likely issue?",
    options: [
      "A. The ECS task execution role is missing permissions",
      "B. The new EC2 instances have the ECS Agent starting but ECR image pulls are failing because the instances are in private subnets without NAT or ECR VPC endpoint; tasks remain in PENDING state waiting for the image",
      "C. The ECS cluster has reached its task limit",
      "D. The ECS service's desired count has not been updated to reflect the new capacity"
    ],
    answer: "B",
    explanation: "ECS container instances register successfully (networking works at the instance level) but task start fails during image pull. In private subnets, the ECS agent needs either a NAT Gateway or VPC endpoints (ecr.api, ecr.dkr, s3 gateway endpoint for ECR layer storage) to pull images from ECR. New instances added by Auto Scaling inherit the subnet configuration — if the subnet lacks the required routing, image pulls fail silently and tasks stay PENDING indefinitely. Check ECS agent logs (/var/log/ecs/ecs-agent.log) on new instances for 'Unable to pull image' errors."
  },
  {
    domain: "Incident & Event Response", num: 96,
    q: "A company uses AWS Step Functions for order processing. A state machine execution fails at the 'PaymentProcessor' state with a transient HTTP 503 from the payment gateway. Currently the entire order must be manually resubmitted. How should the state machine be made resilient to transient failures?",
    options: [
      "A. Add a Retry configuration to the PaymentProcessor state with ErrorEquals: ['States.TaskFailed'], IntervalSeconds: 5, MaxAttempts: 3, BackoffRate: 2; add a Catch configuration to route permanent failures to a manual review state",
      "B. Wrap the Lambda function with try/except and retry inside the Lambda code",
      "C. Use a SQS DLQ on the Lambda function to capture failed payments",
      "D. Increase the Lambda timeout for the payment processor"
    ],
    answer: "A",
    explanation: "Step Functions native Retry configuration handles transient failures at the orchestration level — no application code changes needed. RetryErrorEquals targeting States.TaskFailed (or specific payment gateway error types) with exponential backoff (IntervalSeconds: 5, BackoffRate: 2) retries automatically 3 times. Catch handles cases where all retries are exhausted, routing to a manual review or compensating transaction state. This is state machine error handling — retry logic belongs in the orchestrator, not buried in Lambda application code."
  },
  {
    domain: "Incident & Event Response", num: 97,
    q: "A company's production account received an AWS abuse notification stating that an EC2 instance is participating in a DDoS attack. The instance is part of a critical application that cannot be taken offline. What is the immediate mitigation that minimizes business impact?",
    options: [
      "A. Terminate the instance immediately",
      "B. (1) Apply an outbound security group rule blocking all outbound traffic except to the application's required ports/destinations (whitelist approach); (2) Use VPC Network ACL to block the DDoS target IP from the subnet; (3) Isolate the specific instance using a restrictive security group while keeping the application SG on other healthy instances; (4) Notify AWS Support with the abuse ticket reference; (5) Investigate whether the instance is compromised or a misconfigured load tester",
      "C. Enable AWS Shield Advanced immediately",
      "D. Reboot the instance to clear any malware"
    ],
    answer: "B",
    explanation: "Outbound security group restriction immediately stops the attack traffic without terminating the instance (business continuity preserved). Network ACLs block at the subnet level for additional containment. Isolating only the affected instance (not all instances) maintains application availability via other healthy instances in the ASG. AWS Shield Advanced (Option C) protects your infrastructure from DDoS attacks against your own services — not applicable when your instance is the attacker. Rebooting (Option D) doesn't eliminate a kernel-level rootkit or persistent malware."
  },
  {
    domain: "Incident & Event Response", num: 98,
    q: "An organization uses EventBridge Scheduler for thousands of scheduled Lambda invocations. A change in Lambda function behavior causes all scheduled invocations to fail with a non-retriable error. EventBridge Scheduler's retry policy is set to MaxRetryAttempts=0. Before the error is fixed, how can the failed schedules be identified and retroactively triggered after the fix?",
    options: [
      "A. EventBridge Scheduler does not log failures — review Lambda CloudWatch logs",
      "B. Enable EventBridge Scheduler dead-letter queue (DLQ) on the schedule — failed invocations (after retries exhausted) are sent to an SQS DLQ with the target invocation payload; after fixing the Lambda, a Lambda processes the DLQ to re-invoke with original payloads",
      "C. Use CloudTrail to find all EventBridge Scheduler invocations and manually re-invoke",
      "D. Re-create all schedules with updated configurations"
    ],
    answer: "B",
    explanation: "EventBridge Scheduler supports DLQ configuration (SQS) on individual schedules or schedule groups. Failed invocations after retry exhaustion are sent to the DLQ with the complete target payload. After fixing the Lambda, a Lambda function reads from the DLQ and re-invokes the target with the original payload — effectively replaying all missed executions. The DLQ must be configured BEFORE failures occur; it's not retroactive. The lesson: always configure DLQs on EventBridge Schedules for business-critical invocations."
  },
  {
    domain: "Incident & Event Response", num: 99,
    q: "An ECS Fargate task using awslogs log driver is not sending logs to CloudWatch. The task is running and the application is serving traffic. The ECS task execution role has CloudWatchLogsFullAccess. What should be checked?",
    options: [
      "A. Restart the ECS task to reinitialize the log driver",
      "B. (1) Verify the CloudWatch log group exists — awslogs does not create the log group by default unless awslogs-create-group: true is set in the log configuration options; (2) Verify the task execution role, not the task role, has the CloudWatch permissions — log shipping uses the execution role; (3) Check for VPC endpoint for CloudWatch Logs if tasks are in private subnets",
      "C. Increase the task's memory allocation to support log buffering",
      "D. Switch from awslogs to FireLens log driver"
    ],
    answer: "B",
    explanation: "Three distinct failure modes for ECS awslogs: (1) Missing log group — the most common cause; awslogs sends to an existing group but doesn't create it. Adding awslogs-create-group: 'true' to logConfiguration options auto-creates the group. (2) Wrong IAM role — log shipping is done by the ECS infrastructure using the task EXECUTION role (not the task role). CloudWatchLogsFullAccess must be on the execution role. (3) Network — private Fargate tasks need the com.amazonaws.region.logs VPC endpoint to reach CloudWatch without internet."
  },
  {
    domain: "Incident & Event Response", num: 100,
    q: "A company runs a real-time financial data processing pipeline: Kinesis Data Stream → Lambda → DynamoDB. During a Black Friday traffic spike, Lambda is throttled (reserved concurrency=100), causing the Kinesis iterator age to grow to 8 hours. When throttling subsides, Lambda catches up but processes events out of order, corrupting financial calculations. What architectural change prevents out-of-order processing while handling the traffic spike?",
    options: [
      "A. Increase Lambda reserved concurrency to 1000",
      "B. Kinesis Data Streams + Lambda processes records in strict order within a shard (FIFO per partition key). The actual problem is that catching up after throttling processes records from multiple shards in interleaved order at the application level. Solutions: (1) Ensure financial calculations use DynamoDB conditional writes (optimistic locking) to detect and reject out-of-sequence updates; (2) Use Kinesis Enhanced Fan-Out for dedicated throughput; (3) Reshard the Kinesis stream to increase parallelism without increasing Lambda concurrency per shard; (4) Use SQS FIFO queues with message groups for strict ordering within a financial instrument",
      "C. Switch to SQS standard queue for higher throughput",
      "D. Add a Kinesis Data Analytics application to reorder events by timestamp before Lambda processing"
    ],
    answer: "B",
    explanation: "Kinesis maintains strict FIFO order per shard, but if a financial instrument's events are spread across multiple shards, cross-shard ordering is not guaranteed. Optimistic locking in DynamoDB (using a version/sequence number in condition expressions) rejects updates that arrive out of sequence, preventing silent corruption. Enhanced Fan-Out provides dedicated 2MB/s per consumer per shard, helping with throughput. Resharding increases parallelism. For true strict ordering, SQS FIFO with message groups (one group per financial instrument) guarantees FIFO at scale — each group processes strictly in order."
  }
];

module.exports = { questions };
