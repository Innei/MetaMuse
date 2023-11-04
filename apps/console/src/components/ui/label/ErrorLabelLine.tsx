import { Label } from './Label'

export const ErrorLabelLine = ({
  errorMessage,
  id,
}: {
  id: string
  errorMessage: string
}) => {
  return (
    <div className="mt-2">
      <Label className="text-error font-medium text-xs" htmlFor={id}>
        {errorMessage}
      </Label>
    </div>
  )
}
