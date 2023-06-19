import { FlowConfig } from "../types";

const deepCopyObject = (data) => {
  return JSON.parse(JSON.stringify(data));
};

export default function useMemoryEffect({ getData }: { getData: Function }) {
  
  //TODO 优化成一个列表，两个列表有内存冗余
  const undoList: FlowConfig[] = [];
  const redoList: FlowConfig[] = [];

  const updateMemory = () => {
    const config = deepCopyObject(getData());

    undoList.push(config);

    console.log("undoList", undoList);
  };

  const clearMemory = () => {
    undoList.length = 0;
  };

  const redo = () => {
    if (redoList.length <= 0) {
      return null;
    }

    const config = redoList.pop();
    if (!config) {
      throw new Error("config should not be null");
    }

    undoList.push(deepCopyObject(getData()));

    return config;
  };

  const undo = () => {
    if (undoList.length <= 0) {
      return null;
    }

    //获取当前配置并保存
    redoList.push(deepCopyObject(getData()));

    const pop = undoList.pop();

    if (!pop) {
      console.error("undo config must not be null");
      throw new Error("undo config must not be null");
    }

    return pop;
  };

  return { updateMemory, clearMemory, undo, redo };
}
