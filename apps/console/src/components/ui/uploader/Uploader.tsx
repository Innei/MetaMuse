import { useId, useRef, useState } from 'react'
import axios from 'axios'
import { produce } from 'immer'
import type {
  ChangeEventHandler,
  DetailedHTMLProps,
  InputHTMLAttributes,
  PropsWithChildren,
} from 'react'

import { API_URL } from '~/constants/env'
import { getToken } from '~/lib/cookie'
import { clsxm } from '~/lib/helper'

interface UploaderProps {
  defaultUpload?: string
  uploadUrl?: string
  headers?: Record<string, string>
  withCredentials?: boolean

  onFinish?: (file: File, res: any) => void

  addAuthHeader?: boolean
  bizType?: 'icon'
}

interface FileExtended extends File {
  process?: number
  status?: 'uploading' | 'done' | 'error' | 'pending'
}

export const Uploader: Component<
  PropsWithChildren<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> &
      UploaderProps
  >
> = (props) => {
  const id = useId()
  const {
    className,
    children,
    defaultUpload = true,
    headers,
    withCredentials,

    bizType,
    uploadUrl = `${API_URL}/files/upload?type=${bizType}`,
    addAuthHeader,
    onFinish,
    ...rest
  } = props
  const [fileList, setFileList] = useState<FileExtended[]>([])
  const uploadRef = useRef<HTMLInputElement>(null)

  const handleFileAdded: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files) return
    // pick file
    setFileList(Array.from(e.target.files))

    if (!defaultUpload) return

    for (let i = 0; i < e.target.files.length; i++) {
      uploadFile(e.target.files[i])
    }
  }

  const uploadFile = (file: FileExtended) => {
    const formData = new FormData()
    formData.append('file', file)

    const updateFileStatus = (
      status: FileExtended['status'],
      process?: number,
    ) => {
      setFileList(
        produce((prev) => {
          if (!prev) return prev
          const idx = fileList.findIndex((f) => f === file)
          if (idx === -1) return
          prev[idx].status = status
          if (process !== null) {
            prev[idx].process = process
          }
        }),
      )
    }

    const nextHeaders = { ...headers }

    if (addAuthHeader) {
      nextHeaders['Authorization'] = getToken()!
    }

    axios
      .post(uploadUrl, formData, {
        withCredentials,
        headers: nextHeaders,

        onUploadProgress(progressEvent) {
          if (!progressEvent.total) return
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          updateFileStatus('uploading', percentCompleted)
        },
      })
      .then((res) => {
        onFinish?.(file, res)
        updateFileStatus('done')
      })
      .catch(() => {
        updateFileStatus('error')
      })
  }

  return (
    <>
      <label className={clsxm('cursor-pointer', className)} htmlFor={id}>
        {children}
      </label>

      <input
        {...rest}
        ref={uploadRef}
        className="hidden"
        id={id}
        type="file"
        onChange={handleFileAdded}
      />
    </>
  )
}
