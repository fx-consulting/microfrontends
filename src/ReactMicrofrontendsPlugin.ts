/* eslint-disable import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires */
import { ModuleFederationPluginOptions } from '@module-federation/utilities';
import { Compiler } from 'webpack';
import { configLoader, runtimeLoader } from './loaders';
import { MicrofrontendsConfig, MicrofrontendsRemote } from './types';

export class ReactMicrofrontendsPlugin {
  options?: ModuleFederationPluginOptions;

  constructor(options?: ModuleFederationPluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    const defaultConfigPath = `${process.cwd()}/public/microfrontend.json`;
    const defaultPackageJSONPath = `${process.cwd()}/package.json`;

    const {
      dependencies,
    }: {
      dependencies: { [key: string]: string };
    } = require(`${defaultPackageJSONPath}`);
    const config: MicrofrontendsConfig = require(`${defaultConfigPath}`);

    const { webpack } = compiler;
    const { ModuleFederationPlugin } = webpack.container;
    const options = {
      ...this.options,
      name: this.options?.name || config.name.replace('mf/', ''),
      filename: 'remoteEntry.js',
      remotes: this.options?.remotes || {
        ...Object.fromEntries(
          config.remotes?.map((remote: MicrofrontendsRemote) => [
            remote.name,
            runtimeLoader(config.name, remote),
          ]) || []
        ),
        'mf/config': configLoader(config.name),
      },
      exposes:
        this.options?.exposes ||
        Object.fromEntries(
          Object.entries(config.exports || []).map(([name, module]) => [
            `./${name}`,
            module,
          ])
        ),
      shared: this.options?.shared || [
        Object.fromEntries(
          config.shared?.map((depName: string) => [
            depName,
            {
              singleton: true,
              requiredVersion: dependencies[depName],
            },
          ]) || []
        ),
      ],
    };

    new ModuleFederationPlugin(options).apply(compiler);
  }
}

export default ReactMicrofrontendsPlugin;
