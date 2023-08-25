import { json, type DataFunctionArgs, type V2_MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';

export const meta: V2_MetaFunction = () => [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];

export const loader = async ({ context }: DataFunctionArgs) => json({ count: context.env.METER_DEVICE_ID });

export default () => {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Welcome to Remix</h1>
      <p>{loaderData.count}</p>
      <ul>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/blog" rel="noreferrer">
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/jokes" rel="noreferrer">
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
};
