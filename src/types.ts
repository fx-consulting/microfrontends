export type MicrofrontendsRemote = {
  name: string;
  url: string;
};

export type MicrofrontendsExports = {
  [key: string]: string;
};

export type MicrofrontendsConfig = {
  name: string;
  remotes?: MicrofrontendsRemote[];
  exports?: MicrofrontendsExports;
  shared?: string[];
};

export type MicrofrontendsPluginOptions = {
  dependencies: { [key: string]: string };
  config: MicrofrontendsConfig;
};
