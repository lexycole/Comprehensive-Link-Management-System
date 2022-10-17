export type TOAST_POSITION =  'top' | 'bottom' | 'middle';

export type DISPLAY_TOAST_OPTIONS = {
  message: string,
  duration?: number,
  position?: TOAST_POSITION,
  btnText?: string;
 };
