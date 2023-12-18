interface IOption {
  value: number | string;
  label: string;
}

export const DEVICE_NAME: Array<IOption>= [
{ value: '00 01', label: '00 01' },
{ value: '00 02', label: '00 02' },
];

export const LIGHT_CONTROL: Array<IOption> = [
  { value: '1', label: '场所灯操作' },
  { value: '2', label: '区操作' },
  { value: '3', label: '单灯操作' },
  { value: '4', label: '群组操作' },
  { value: '5', label: '标签操作' },
];
