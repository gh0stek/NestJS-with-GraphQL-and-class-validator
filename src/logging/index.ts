import {
  createLogger,
  transports,
  format,
  Logger,
  LoggerOptions,
} from 'winston'

export const getLoggingOptions = (moduleName: string): LoggerOptions => {
  const isDevelopmentEnvironment =
    process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'local'

  const labelFormat = format.label({ label: moduleName, message: true })
  const loggingFormat = isDevelopmentEnvironment
    ? format.combine(
        labelFormat,
        format.colorize(),
        format.simple(),
        format.timestamp(),
      )
    : format.combine(labelFormat, format.timestamp(), format.json())

  const loggingOption: LoggerOptions = {
    transports: [new transports.Console()],
    format: loggingFormat,
  }
  if (process.env.LOGGING_LEVEL) {
    loggingOption.level = process.env.LOGGING_LEVEL
  }

  return loggingOption
}

export const getLogger = (moduleName: string): Logger => {
  return createLogger(getLoggingOptions(moduleName))
}
