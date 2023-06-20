export type NodeConfig = {
  name?: String;
  id: string | number | undefined | Symbol;
  pos: {
    left: Number;
    top: Number;
  };
  type: NodeTypes;
  fields?: Object[];
  errors?: NodeError[];
};

export type LineConfig = {
  id: String | Number;
  source: string | number | undefined | Symbol;
  target: string | number | undefined | Symbol;
  label?: String;
  conditions?: any[];
  remark?: String;
};

export type FlowConfig = {
  nodeList: NodeConfig[];
  connections: LineConfig[];
};

export enum NodeError {
  noStart = "noStart",
  noEnd = "noEnd",
  conditionMissing = "conditionMissing",
  conditionError = "conditionError",
}

export enum NodeTypes {
  start = "start",
  end = "end",
  node = "node",
  sendCopy = "sendCopy",
  childFlow = "childFlow",
  widgetFlow = "widgetFlow", //插件节点
}

export type FlowValidationErrors = {
  nodes: {
    errors: NodeError[];
    node: NodeConfig;
  }[];
  connections: {
    errors: NodeError[];
    node: LineConfig;
  }[];
};
