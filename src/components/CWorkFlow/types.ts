export type NodeConfig = {
  name?: String;
  id: String | Number;
  pos: {
    left: Number;
    top: Number;
  };
  type: string;
  fields?: Object[];
};

export type LineConfig = {
  id: String | Number;
  source: String | Number;
  target: String | Number;
  label?: String;
  conditions?: any[];
  remark?: String;
};

export type FlowConfig = {
  nodeList: NodeConfig[];
  connections: LineConfig[];
};
