export const flowConfig = {
  nodeList: [
    { id: "1", name: "上级领导", pos: { left: 360, top: 175 } },
    { id: "2", name: "HR", pos: { left: 140, top: 260 } },
    {
      type: "start",
      name: "开始",
      id: "45x07jjilm4000",
      pos: { top: 25, left: 360 },
    },
    {
      type: "end",
      name: "结束",
      id: "258865t00l4000",
      pos: { top: 485, left: 355 },
    },
    {
      type: "node",
      name: "总经理",
      id: "2svfiqfpi5u000",
      pos: { top: 255, left: 570 },
    },
    {
      type: "sendCopy",
      name: "抄送",
      id: "29t6y8grdf2800",
      pos: { top: 270, left: 825 },
    },
  ],
  connections: [
    { id: "2qxrsxfyu7u000", source: "1", target: "2", name: "不重要" },
    {
      source: "45x07jjilm4000",
      target: "1",
      name: "",
      id: "3gbvuvnbs0k000",
      remark: "",
    },
    {
      source: "2",
      target: "258865t00l4000",
      name: "",
      id: "18wfi6bfb19c00",
      remark: "",
    },
    {
      source: "2svfiqfpi5u000",
      target: "258865t00l4000",
      name: "",
      id: "3z3szkm6m46000",
      remark: "",
    },
    {
      source: "1",
      target: "2svfiqfpi5u000",
      name: "重要",
      id: "5hpri7h21no000",
      remark: "",
    },
    {
      source: "2svfiqfpi5u000",
      target: "29t6y8grdf2800",
      name: "",
      id: "53d42gm3zn0000",
      remark: "",
    },
  ],
};
