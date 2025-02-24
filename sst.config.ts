/// <reference path='./.sst/platform/config.d.ts' />

export default $config({
  app(input) {
    return {
      name: 'aws-hono',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    };
  },
  async run() {
    const isProdOrStaging = ['production', 'staging'].includes($app.stage);

    const vpc = isProdOrStaging
      ? new sst.aws.Vpc('MyVpc', { bastion: true, nat: 'managed' })
      : sst.aws.Vpc.get('MyVpc', 'vpc-0fa080996a20df98b');

      
    const database = isProdOrStaging
      ? new sst.aws.Aurora('MyDatabase', {
          engine: 'postgres',
          scaling: {
            min: '0 ACU',
            max: '1 ACU'
          },
          vpc,
        })
      : sst.aws.Aurora.get('MyDatabase', 'aws-hono-staging-mydatabasecluster');

    const api = new sst.aws.Function('Hono', {
      url: true,
      link: [database],
      vpc,
      handler: 'src/index.handler',
    });

    new sst.aws.Nextjs("MyWeb", {
      path: 'frontend',
      environment: {
        NEXT_PUBLIC_API_URL: api.url,
      }
    });
  },
});
