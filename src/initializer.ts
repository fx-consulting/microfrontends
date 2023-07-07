/* eslint-disable no-underscore-dangle */

export async function initializer() {
  if (!window.__mf) {
    window.__mf = { configs: {}, configUrls: {} };
  }

  const configHost = await fetch('microfrontend.json');
  const configJSON = await configHost.json();
  window.__mf.configs[configJSON.name] = configJSON;

  const promises = configJSON.remotes.map(
    async ({ name, url }: { name: string; url: string }) => {
      try {
        const config = await fetch(
          `${url.replace('static/chunks', '')}microfrontend.json`
        ).then((r) => r.json());

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
