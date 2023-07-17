import fs from 'fs-extra';
import path from 'path';
import { defineNuxtModule, createResolver } from '@nuxt/kit';
// import copy from 'rollup-plugin-copy';
import { getSvgIconsConfig, setPlugin } from './mod';
// import type { svgsOptions } from './types';
// Module options TypeScript interface definition
export * from './types';
export interface ModuleOptions {}
const resolver = createResolver(import.meta.url);
export default defineNuxtModule<ModuleOptions>({
    meta: {
        // name 与 configKey 是不相同的
        name: 'nuxt-svgs-icon',
        configKey: 'NuxtSvgIcon',
        compatibility: {
            // Semver version of supported nuxt versions
            nuxt: '^3.4.1'
        }
    },
    // Nuxt模块的默认配置选项
    defaults: {},
    async setup (options: any, nuxt: any) {
        const dev = nuxt.options.dev; // dev = true 开发环境
        const envMode = nuxt.options.vite.mode; // 环境变量
        options.debug && console.log('dev=>', dev, 'envMode=>', envMode);
        const rootDir = nuxt.options.rootDir; // 项目根目录的path
        const svgIconsConfig = getSvgIconsConfig({
            ...options,
            rootDir,
            buildDir: rootDir
        })
        if (!dev) {
            nuxt.options.nitro.hooks = {
                compiled(nitro: any) {
                    const output = nitro.options.output;
                    svgIconsConfig.buildDir = path.resolve(output.publicDir, 'svg');
                    options.debug && console.log('svgIconsConfig=>', svgIconsConfig);
                    fs.copySync(svgIconsConfig.dir, svgIconsConfig.buildDir);
                }
            }
        }
        const runtimeDir = resolver.resolve('runtime');
        const injectionHtmlPlugin = resolver.resolve(runtimeDir, 'server', 'injectionHtml');
        setPlugin(nuxt, svgIconsConfig, runtimeDir, injectionHtmlPlugin);
    }
})
