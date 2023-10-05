import { Spinner } from '@nextui-org/react'
import { createElement, useEffect, useRef, useState } from 'react'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { useEventCallback } from 'usehooks-ts'
import type { editor, IKeyboardEvent } from 'monaco-editor'

import Dark from '~/assets/monaco/theme/dark.json'
import Light from '~/assets/monaco/theme/light.json'

import { useTheme } from './use-theme'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

const set = new Set()
const useDefineTheme = (theme: string, json: any, cb: (m: any) => any) => {
  useEffect(() => {
    import('monaco-editor').then((monaco) => {
      monaco.editor.defineTheme(theme, json)
      set.add(theme)

      cb(monaco)
    })
  }, [cb, json, theme])
}

const useDefineMyThemes = () => {
  const isDark = useTheme().actualTheme === 'dark'
  const cb = useEventCallback((monaco: any) => {
    if (isDark) {
      monaco.editor.setTheme('dark')
    } else {
      monaco.editor.setTheme('light')
    }
  })
  useDefineTheme('light', Light, cb)
  useDefineTheme('dark', Dark, cb)
}

const useToggleTheme = (editor: editor.IStandaloneCodeEditor) => {
  const isDark = useTheme().actualTheme === 'dark'

  useEffect(() => {
    if (!editor) return
    editor.updateOptions({
      theme: isDark ? 'dark' : 'light',
    })
  }, [editor, isDark])
}

export const useAsyncMonaco = (
  initialValue: string,
  onChange: (value: string) => void,
  options: editor.IStandaloneEditorConstructionOptions & {
    unSaveConfirm?: boolean
  },
) => {
  const { unSaveConfirm = true, ...monacoOptions } = options

  const editorWrapperRef = useRef<HTMLDivElement>(null)

  useDefineMyThemes()
  const [loaded, setLoaded] = useState(false)

  const monacoRef = useRef({
    editor: null as any as editor.IStandaloneCodeEditor,
    module: null as any as typeof import('monaco-editor'),
  })

  useToggleTheme(monacoRef.current.editor)

  const isDark = useTheme().actualTheme === 'dark'

  const editorModelRef = useRef<editor.ITextModel>()
  // TODO typing core
  //

  useEffect(() => {
    const value = initialValue
    let isMounted = true
    let scopeEditor = null as any as editor.IStandaloneCodeEditor
    import('monaco-editor').then((module) => {
      if (!isMounted) return
      const options: editor.IStandaloneEditorConstructionOptions = {
        ...monacoOptions,
        value,
        theme: isDark ? 'dark' : 'light',
        automaticLayout: true,
        cursorStyle: 'line-thin',
        minimap: { enabled: false },
        tabSize: 2,
        fontFamily: 'operator mono, fira code, monaco, monospace',
        fontSize: 14,
      }
      if (options.language === 'typescript') {
        const editorModel = module.editor.createModel(value, 'typescript')
        Object.assign(options, {
          model: editorModel,
        })

        editorModelRef.current = editorModel
      }

      const editor = module.editor.create(editorWrapperRef.current!, options)
      scopeEditor = editor

      monacoRef.current.editor = editor
      // typingCore = AutoTypings.create(monaco.editor, {
      //   sourceCache: new LocalStorageCache(), // Cache loaded sources in localStorage. May be omitted
      //   preloadPackages: true,
      //   versions: {
      //     '@types/node': '^18',
      //   },
      // })

      monacoRef.current.module = module
      ;['onKeyDown', 'onDidPaste', 'onDidBlurEditorText'].forEach(
        (eventName) => {
          const editor = monacoRef.current.editor
          // @ts-ignore
          editor[eventName](() => {
            const value = editor.getValue()
            onChange(value)
          })
        },
      )

      editor.addAction({
        id: 'trigger-suggestion',
        label: 'Trigger Suggestion',
        keybindings: [module.KeyMod.Shift | module.KeyCode.Space],
        run: () => {
          editor.trigger('', 'editor.action.triggerSuggest', {})
        },
      })

      editor.addAction({
        id: 'format',
        label: 'Format Document',
        keybindings: [
          module.KeyMod.Shift | module.KeyCode.KeyF | module.KeyMod.CtrlCmd,
        ],
        run: () => {
          editor.trigger('', 'editor.action.formatDocument', {})
        },
      })

      function stopHotKey(e: IKeyboardEvent) {
        const keys = [module.KeyCode.KeyS, module.KeyCode.KeyF]
        if ((e.ctrlKey || e.metaKey) && keys.includes(e.keyCode)) {
          e.preventDefault()
        }
      }
      editor.onKeyDown((e) => {
        stopHotKey(e)
      })
      editor.onKeyUp((e) => {
        stopHotKey(e)
      })
      setLoaded(true)
    })

    return () => {
      isMounted = false

      if (editorModelRef.current) {
        editorModelRef.current.dispose()
      }

      if (scopeEditor) {
        scopeEditor.dispose()
      }
    }
  }, [])

  return {
    editorWrapperRef,
    monacoRef,
    loadingElement: loaded ? null : createElement(Spinner),
  }
}
