import { LindaWeb } from '../lindaweb.js';
import utils from '../utils/index.js';
import semver from 'semver';

interface PluginConstructorOptions {
    disablePlugins?: boolean;
}

interface PluginClassInterface {
    new (lindaWeb: LindaWeb): {
        pluginInterface?: (options: PluginOptions) => PluginInterfaceReturn;
    };
}

interface PluginInterfaceReturn {
    requires: string;
    components?: Record<string | number | symbol, any>;
    fullClass?: boolean;
}

type PluginOptions = any;

export class Plugin {
    lindaWeb: LindaWeb;
    pluginNoOverride: string[];
    disablePlugins: boolean;

    constructor(lindaWeb: LindaWeb, options: PluginConstructorOptions = {}) {
        if (!lindaWeb || !(lindaWeb instanceof LindaWeb)) throw new Error('Expected instance of LindaWeb');
        this.lindaWeb = lindaWeb;
        this.pluginNoOverride = ['register'];
        this.disablePlugins = !!options.disablePlugins;
    }

    register(Plugin: PluginClassInterface, options?: PluginOptions) {
        let pluginInterface: PluginInterfaceReturn = {
            requires: '0.0.0',
            components: {},
        };
        const result: {
            libs: any[];
            plugged: any[];
            skipped: any[];
            error?: string;
        } = {
            libs: [],
            plugged: [],
            skipped: [],
            error: undefined,
        };
        if (this.disablePlugins) {
            result.error = 'This instance of LindaWeb has plugins disabled.';
            return result;
        }
        const plugin = new Plugin(this.lindaWeb);
        if (utils.isFunction(plugin.pluginInterface)) {
            pluginInterface = plugin.pluginInterface(options);
        }
        if (semver.satisfies(LindaWeb.version, pluginInterface.requires)) {
            if (pluginInterface.fullClass) {
                // plug the entire class at the same level of lindaWeb.lind
                const className = plugin.constructor.name;
                const classInstanceName = className.substring(0, 1).toLowerCase() + className.substring(1);
                if (className !== classInstanceName) {
                    Object.assign(LindaWeb, {
                        [className]: Plugin,
                    });
                    Object.assign(this.lindaWeb, {
                        [classInstanceName]: plugin,
                    });
                    result.libs.push(className);
                }
            } else {
                // plug methods into a class, like lind
                for (const component in pluginInterface.components) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (!this.lindaWeb.hasOwnProperty(component)) {
                        continue;
                    }
                    const methods = pluginInterface.components[component];
                    const pluginNoOverride = (this.lindaWeb as any)[component].pluginNoOverride || [];
                    for (const method in methods) {
                        if (
                            method === 'constructor' ||
                            ((this.lindaWeb as any)[component][method] &&
                                (pluginNoOverride.includes(method) || // blacklisted methods
                                    /^_/.test(method))) // private methods
                        ) {
                            result.skipped.push(method);
                            continue;
                        }
                        (this.lindaWeb as any)[component][method] = methods[method].bind((this.lindaWeb as any)[component]);
                        result.plugged.push(method);
                    }
                }
            }
        } else {
            throw new Error('The plugin is not compatible with this version of LindaWeb');
        }
        return result;
    }
}
