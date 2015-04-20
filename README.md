# chrome-tailor-jetpack [![Build Status](https://travis-ci.org/jetpack-labs/chrome-tailor-jetpack.png)](https://travis-ci.org/jetpack-labs/chrome-tailor-jetpack)

Skeleton Firefox extension that can run a Chrome extension.

## Supported APIs

### Chrome APIs

APIs supported from the [Chrome extension API](https://developer.chrome.com/extensions/api_index). Only supporting stable APIs.

#### Supported

* [chrome.topSites](https://developer.chrome.com/extensions/topSites)

#### Partial Support

* [chrome.browserAction](https://developer.chrome.com/extensions/browserAction)
  * `chrome.browserAction.onClick.addListener` supported
* [chrome.extension](https://developer.chrome.com/extensions/extension)
  * `getURL` supported
* [chrome.history](https://developer.chrome.com/extensions/history)
  * `addUrl`, `deleteAll`, `deleteUrl` supported
  * More detailed needed for models used here
* [chrome.runtime](https://developer.chrome.com/extensions/runtime)
  * `getURL`, `getManifest`, `onMessage`, `sendMessage`
* [chrome.tabs](https://developer.chrome.com/extensions/tabs)
  * `create`, `duplicate`, `executeScript`, `getCurrent`, `query`, `remove`, `sendMessage`

#### Not Yet Supported

* [chrome.accessibilityFeatures](https://developer.chrome.com/extensions/accessibilityFeatures)
* [chrome.alarms](https://developer.chrome.com/extensions/alarms)
* [chrome.bookmarks](https://developer.chrome.com/extensions/bookmarks)
* [chrome.browsingData](https://developer.chrome.com/extensions/browsingData)
* [chrome.commands](https://developer.chrome.com/extensions/commands)
* [chrome.contentSettings](https://developer.chrome.com/extensions/contentSettings)
* [chrome.contextMenus](https://developer.chrome.com/extensions/contextMenus)
* [chrome.cookies](https://developer.chrome.com/extensions/cookies)
* [chrome.debugger](https://developer.chrome.com/extensions/debugger)
* [chrome.declaritiveContent](https://developer.chrome.com/extensions/declarativeContent)
* [chrome.desktopCapture](https://developer.chrome.com/extensions/desktopCapture)
* [chrome.devtoolsInspectedWindow](https://developer.chrome.com/extensions/devtools.inspectedWindow)
* [chrome.devtools.network](https://developer.chrome.com/extensions/devtools.network)
* [chrome.devtools.panel](https://developer.chrome.com/extensions/devtools.panels)
* [chrome.downloads](https://developer.chrome.com/extensions/downloads)
* [chrome.enterprise.platformKeys](https://developer.chrome.com/extensions/enterprise.platformKeys)
* [chrome.events](https://developer.chrome.com/extensions/events)
* [chrome.extensionTypes](https://developer.chrome.com/extensions/extensionTypes)
* [chrome.fileBrowserHandler](https://developer.chrome.com/extensions/fileBrowserHandler)
* [chrome.fileSystemProvider](https://developer.chrome.com/extensions/fileSystemProvider)
* [chrome.fontSettings](https://developer.chrome.com/extensions/fontSettings)
* [chrome.gcm](https://developer.chrome.com/extensions/gcm)
* [chrome.i18n](https://developer.chrome.com/extensions/i18n)
* [chrome.identity](https://developer.chrome.com/extensions/identity)
* [chrome.idle](https://developer.chrome.com/extensions/idle)
* [chrome.input.ime](https://developer.chrome.com/extensions/input.ime)
* [chrome.management](https://developer.chrome.com/extensions/management)
* [chrome.notifications](https://developer.chrome.com/extensions/notifications)
* [chrome.omnibox](https://developer.chrome.com/extensions/omnibox)
* [chrome.pageAction](https://developer.chrome.com/extensions/pageAction)
* [chrome.permissions](https://developer.chrome.com/extensions/permissions)
* [chrome.power](https://developer.chrome.com/extensions/power)
* [chrome.privacy](https://developer.chrome.com/extensions/privacy)
* [chrome.proxy](https://developer.chrome.com/extensions/proxy)
* [chrome.sessions](https://developer.chrome.com/extensions/sessions)
* [chrome.storage](https://developer.chrome.com/extensions/storage)
* [chrome.system.cpu](https://developer.chrome.com/extensions/system.cpu)
* [chrome.system.memory](https://developer.chrome.com/extensions/system.memory)
* [chrome.system.storage](https://developer.chrome.com/extensions/system.storage)
* [chrome.tabCapture](https://developer.chrome.com/extensions/tabCapture)
* [chrome.tts](https://developer.chrome.com/extensions/tts)
* [chrome.ttsEngine](https://developer.chrome.com/extensions/ttsEngine)
* [chrome.types](https://developer.chrome.com/extensions/types)
* [chrome.webNavigation](https://developer.chrome.com/extensions/webNavigation)
* [chrome.webRequest](https://developer.chrome.com/extensions/webRequest)
* [chrome.webstore](https://developer.chrome.com/extensions/webstore)
* [chrome.windows](https://developer.chrome.com/extensions/windows)

#### Not Supported

* [chrome.wallpaper](https://developer.chrome.com/extensions/wallpaper)

### Manifest Declarations

Commands from [manifest.json](https://developer.chrome.com/extensions/manifest) currently supported. Not listing the metadata fields such as `name`, `version`, etc.

#### Supported

* [background](https://developer.chrome.com/extensions/background)
* [browser_action](https://developer.chrome.com/extensions/browserAction)
* [chrome_url_overrides](https://developer.chrome.com/extensions/ui_override)

#### Partial Support

* [content_scripts (in-progress)](https://developer.chrome.com/extensions/content_scripts)

#### Not Yet Supported

* [background.persistent (event pages)](https://developer.chrome.com/extensions/event_pages)
* [chrome_settings_overrides](https://developer.chrome.com/extensions/settings_override)
* [chrome_url_overrides](https://developer.chrome.com/extensions/override)
* [commands](https://developer.chrome.com/extensions/commands)
* [content_security_policy](https://developer.chrome.com/extensions/contentSecurityPolicy)
* [devtools_page](https://developer.chrome.com/extensions/devtools)
* [externally_connectable](https://developer.chrome.com/extensions/manifest/externally_connectable)
* [import](https://developer.chrome.com/extensions/shared_modules)
* [file_browser_handlers](https://developer.chrome.com/extensions/fileBrowserHandler)
* [incognito](https://developer.chrome.com/extensions/manifest/incognito)
* [omnibox](https://developer.chrome.com/extensions/omnibox)
* [optional_permissions](https://developer.chrome.com/extensions/permissions)
* [options_page](https://developer.chrome.com/extensions/options)
* [options_ui](https://developer.chrome.com/extensions/optionsV2)
* [permissions](https://developer.chrome.com/extensions/declare_permissions)
* [sandbox](https://developer.chrome.com/extensions/manifest/sandbox)
* [storage](https://developer.chrome.com/extensions/manifest/storage)
* [tts_engine](https://developer.chrome.com/extensions/ttsEngine)
* [web_accessible_resources](https://developer.chrome.com/extensions/manifest/web_accessible_resources)

#### Not Supported

* [nacl_modules](https://developer.chrome.com/extensions/manifest/nacl_modules)
* [requirements](https://developer.chrome.com/extensions/manifest/requirements)
