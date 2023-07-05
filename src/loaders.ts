import { MicrofrontendsRemote } from './types';

export const runtimeLoader = (
  name: string,
  remote: MicrofrontendsRemote
) => `promise new Promise(resolve => {
    const config = window.__mf.configs['${name}'];
    const isConfig = '${remote.name}' === 'mf/config';
    if(isConfig) { 
      const proxy = {
        get: (request) => () => config,
        init: (arg) => {
          try {
            return () => config
          } catch(e) {
            console.log('remote container already initialized')
          }
        }
      }
      resolve(proxy)
    } else {
      const url = config.MICROFRONTENDS.REMOTES.find(r => r.NAME === '${
        remote.name
      }').URL
      const remoteUrl = url + 'remoteEntry.js'
      const script = document.createElement('script')
      script.src = remoteUrl;
      script.onerror = () => {
        console.log('Error loading ' + '${remote.name}');
        const proxy = {
          get: (request) => () => '',
          init: (arg) => () => ''
        }
        resolve(proxy)
      };
      
      script.onload = () => {
        const proxy = {
          get: (request) => window.${remote.name.replace(
            'mf/',
            ''
          )}.get(request),
          init: (arg) => {
            try {
              return window.${remote.name.replace('mf/', '')}.init(arg)
            } catch(e) {
              console.log('remote container already initialized')
            }
          }
        }
        resolve(proxy)
      }
      document.head.appendChild(script);
  
    }
    })
  `;

export const configLoader = (name: string) =>
  `promise Promise.resolve({get:()=>() => window.__mf.configs['${name}'],init:()=>{}})`;
