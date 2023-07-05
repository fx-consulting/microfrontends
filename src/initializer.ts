/* eslint-disable no-underscore-dangle */

export async function initializer() {
  if (!window.__mf) {
    window.__mf = { configs: {}, configUrls: {} };
  }

  const configHost = await fetch('config.json');
  const configJSON = await configHost.json();
  window.__mf.configs[configJSON.microfrontends.name] = configJSON;

  const promises = configJSON.microfrontends.remotes.map(
    async ({ name, url }: { name: string; url: string }) => {
      try {
        const config = await fetch(`${url}/config.json`).then((r) => r.json());

        window.__mf.configs[name] = config;
        return {
          name,
          config,
        };
      } catch {
        return {};
      }
    }
  );

  await Promise.all(promises);
}

export default initializer;
