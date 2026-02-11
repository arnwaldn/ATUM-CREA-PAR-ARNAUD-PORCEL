export interface Component {
  readonly type: string
}

export abstract class BaseComponent implements Component {
  abstract readonly type: string
}
