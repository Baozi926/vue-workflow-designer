export const flowConfig = {
  nodes: [
    { id: "1", name: "上级领导", pos: { left: 360, top: 175 } },
    { id: "2", name: "HR", pos: { left: 100, top: 260 } },
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
    {
      source: "45x07jjilm4000",
      target: "1",
      label: "",
      id: "26az1faot2e800",
      remark: "",
    },
    {
      source: "1",
      target: "2",
      label: "不重要",
      id: "4bdteb81vhg000",
      remark: "",
    },
    {
      source: "2",
      target: "258865t00l4000",
      label: null,
      id: "2tdh4tkos6q000",
      remark: "",
    },
    {
      source: "2svfiqfpi5u000",
      target: "258865t00l4000",
      label: null,
      id: "4blzeek8q9k000",
      remark: "",
    },
    {
      source: "1",
      target: "2svfiqfpi5u000",
      label: "重要",
      id: "4jcyh9my6gi000",
      remark: "",
    },
    {
      source: "2svfiqfpi5u000",
      target: "29t6y8grdf2800",
      label: null,
      id: "1p8h4n7nmc6800",
      remark: "",
    },
  ],
};

export const flowConfig_example_a = {
  nodes: [
    { id: "1", name: "上级领导", pos: { left: 360, top: 230 } },
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
      pos: { top: 485, left: 360 },
    },
  ],
  connections: [
    {
      source: "45x07jjilm4000",
      target: "1",
      label: null,
      id: "gm9065kox6g00",
      remark: "",
    },
    {
      source: "1",
      target: "258865t00l4000",
      label: null,
      id: "3lnf0rgp802000",
      remark: "",
    },
  ],
};

export const flowConfig_example_b = {
  nodes: [
    { id: "1", name: "上级领导", pos: { left: 360, top: 175 } },
    { id: "2", name: "HR", pos: { left: 100, top: 260 } },
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
    {
      type: "node",
      name: "审批",
      id: "cet0bre57fc00",
      pos: { top: 51, left: 159 },
    },
  ],
  connections: [
    {
      source: "45x07jjilm4000",
      target: "1",
      label: "",
      id: "26az1faot2e800",
      remark: "",
    },
    {
      source: "1",
      target: "2",
      label: "不重要",
      id: "4bdteb81vhg000",
      remark: "",
    },
    {
      source: "2",
      target: "258865t00l4000",
      label: null,
      id: "2tdh4tkos6q000",
      remark: "",
    },
    {
      source: "2svfiqfpi5u000",
      target: "258865t00l4000",
      label: null,
      id: "4blzeek8q9k000",
      remark: "",
    },
    {
      source: "1",
      target: "2svfiqfpi5u000",
      label: "重要",
      id: "4jcyh9my6gi000",
      remark: "",
    },
    {
      source: "2svfiqfpi5u000",
      target: "29t6y8grdf2800",
      label: null,
      id: "1p8h4n7nmc6800",
      remark: "",
    },
    {
      source: "cet0bre57fc00",
      target: "2",
      label: null,
      id: "4gtvkqy9ch0000",
      remark: "",
    },
  ],
};
