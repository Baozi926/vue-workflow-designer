export type NodeConfig = {
  name?: String;
  id: String | Number;
  pos: {
    left: Number;
    top: Number;
  };
  fields?: Object[];
};

export type LineConfig = {
  id: String | Number;
  source: String | Number;
  target: String | Number;
  name?: String;
  conditions?: any[];
  remark?: String;
};
