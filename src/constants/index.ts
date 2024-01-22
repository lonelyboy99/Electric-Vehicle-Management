interface IOption {
  value: number | string;
  label: string;
}

export const DEVICE_NAME: Array<IOption>= [
  { value: "00 01", label: "00 01" },
  { value: "00 02", label: "00 02" },
]

export const LIGHT_CONTROL: Array<IOption> = [
  { value: "1", label: "场所灯操作" },
  { value: "2", label: "区操作" },
  { value: "3", label: "单灯操作" },
  { value: "4", label: "群组操作" },
  { value: "5", label: "标签操作" },
]
export const PROJECT_SELECTION: Array<IOption> = [
  { value: "全部项目", label: "全部项目" },
  { value: "景枫", label: "景枫" },
  { value: "南邮", label: "南邮" },
  { value: "xx", label: "xx" },
]
export const DELAY_TIME: Array<IOption> = [
  { value: "0", label: "0" },
  { value: "5", label: "5" },
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "60", label: "60" },
  { value: "120", label: "120" },
  { value: "300", label: "300" },
  { value: "600", label: "600" },
  { value: "900", label: "900" },
  { value: "1800", label: "1800" },
]

