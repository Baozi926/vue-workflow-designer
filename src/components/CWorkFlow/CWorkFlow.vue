<style lang="scss">
.workflow-layout {


    .row {
        display: flex;
        flex-direction: row;

        .main {
            flex: 1
        }

        .end {
            display: flex;
            margin-left: auto;
            align-items: center;
        }

        align-items: center;
    }

    .caiwf-line-label {
        color: black;
        font-size: 12px;
    }

    .node-item-label {
        color: black;
        z-index: 2000;
    }

    .jtk-connector.selected {
        z-index: 200;

        path {
            stroke: #409eff;
            stroke-width: 2.4;
        }
    }

    .label-editor {
        // width: 252px;
        // width: 100%;
        // height: 100%;
        padding: 2px;
        overflow: hidden;
        color: #525967;
        font-size: 12px;
        text-align: center;
        border: none !important;

    }
}
</style>

<style lang="scss" scoped>
.workflow-layout {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .head {
        height: 60px;
        display: flex;
        align-items: center;
        background: #fff;
        box-shadow: rgba(6, 30, 53, 0.1) 0px 1px 0 0;
        border-bottom: 1px solid #ebecee;
        padding: 0 20px;

        .toolbox {
            width: 100%;
            display: flex;

            .zoom-wrapper {
                // width: 120px;
                color: black;
                flex-direction: row;
                display: flex;
                white-space: nowrap;

                .zoom-input {
                    width: 120px;
                }

                .zoom-label {
                    margin-right: 10px;
                    display: flex;
                    align-items: center;
                }

                padding: 10px;
            }
        }
    }

    .main {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        flex: 1;
    }

    .flow-node-list {
        padding: 10px;
        background: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;

        .menu {
            cursor: pointer;
            border-radius: 8px;
            // border: 1px solid black;
            width: 120px;
            height: 40px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 5px;
            display: flex;
            background: #fff;
            box-shadow: rgba(6, 30, 53, 0.1) 0px 1px 2px 1px;
            color: black;
        }

        flex-basis: 200px;
        width: 200px;
    }

    .flow_region {
        background-color: rgb(245, 246, 248);
        flex: 1;

        .flow-wrap {
            height: 100%;
            width: 100%;
            overflow: hidden;

            #flow-container {
                position: relative;
                width: 100%;
                height: 100%;
            }
        }
    }

    .property-panel {
        width: 300px;
        background: #fff;
    }
}
</style>

<template>
    <div class="workflow-layout">
        <div class="head">
            <div class="row toolbox">

                <div class="start">
                    <ElButton @click="doClearAll" :icon="Refresh" class="button"> 清空</ElButton>
                    <ElButton @click="doUndo" :icon="RefreshLeft" class="button">撤销</ElButton>
                    <ElButton @click="doRedo" :icon="RefreshRight" class="button">重做</ElButton>

                    <ElButton type="danger" :icon="Delete" @click="doDeleteNodeOrLine" class="button">删除</ElButton>
                </div>
                <div class="main">

                </div>
                <div class="end">
                    <div class="zoom-wrapper">
                        <div class="zoom-label">缩放:</div>
                        <el-input-number class="zoom-input" v-model="zoom" :step="0.1" :min="0" :max="1"
                            @change="onZoomChange" />
                    </div>
                    <ElButton @click="copyConfig" class="button">拷贝配置</ElButton>
                    <el-popover placement="bottom" :width="400" trigger="click">
                        <template #reference>
                            <ElButton @click="viewConfig" class="button">显示配置</ElButton>
                        </template>
                        <div style="max-height:50vh;overflow-y: auto;" ref="configJSONRef">


                        </div>
                    </el-popover>

                    <ElButton @click="loadConfigExample_1" class="button">载入配置1</ElButton>
                    <ElButton @click="loadConfigExample_2" class="button">载入配置2</ElButton>
                    <ElButton @click="loadConfigExample_3" class="button">载入配置3</ElButton>

                    <ElButton @click="doAutoLayoutWorkFlow" class="button">格式化布局</ElButton>
                    <ElButton @click="doCheckWorkFlow" class="button">流程检测</ElButton>
                </div>
            </div>





        </div>

        <div class="main">
            <div class="flow-node-list">
                <li class="menu" v-for="menu in data.menus.filter((v) => {
                    return !['start', 'end'].includes(v?.type);
                })" :key="menu.type" draggable="true" @dragstart="dragstart($event, menu)">
                    <!-- <i :class="`iconfont ${menu.iconName}`"></i> -->
                    {{ menu.name }}
                </li>
            </div>
            <div class="flow_region" @click="onCanvasClick($event)">
                <div id="flowWrap" ref="flowWrap" class="flow-wrap" @drop="onDrop($event)" @dragover="allowDrop($event)">
                    <div id="flow-container" ref="flowContainerRef">
                        <FlowNode @click="onFlowNodeClick($event, item)" :isActive="activeNode?.id === item.id"
                            v-for="item in data.nodes" :id="item.id" :key="item.id" :node="item" @setNodeName="setNodeName"
                            @changeLineState="changeLineState" />
                    </div>
                </div>
            </div>
            <div class="property-panel">
                <template v-if="activeNode">
                    <PropertyPanel :node="activeNode"></PropertyPanel>
                </template>
                <template v-else-if="activeLine">
                    <LinePanel :line="activeLine"></LinePanel>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, onUnmounted, nextTick, toRefs, ref } from "vue";
import useMemoryEffect from './hooks/useMemoryEffect'
import FlowNode from "./FlowNode.vue";
import {
    jsplumbSourceOptions,
    jsplumbTargetOptions,
    jsplumbConnectOptions,
    jsplumbSetting,
    nodeTypeList, nodeHeight, nodeWidth

} from "./config";
import { uuid, deepCloneJSON } from "./Utils";
import { NodeConfig, LineConfig } from "./types";
import PropertyPanel from "./PropertyPanel.vue";
import LinePanel from "./LinePanel.vue";
import { Delete, Refresh, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import { flowConfig_example_a, flowConfig, flowConfig_example_b } from './tempData'
import { ElMessage } from 'element-plus'

import usePlumbService from "./hooks/usePlumbService";
import useKeydown from './hooks/useKeydown'
import JSONFormatter from 'json-formatter-js'

const { plumbService } = usePlumbService()

//@ts-ignore
window.plumbService = plumbService


/**
 * 流程节点容器
 * 
*/
const flowContainerRef = ref<null | HTMLElement>();

const configJSONRef = ref<null | HTMLElement>();

const onFlowNodeClick = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveNode(item);
};

const copyToClipboard = (str) => {
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
};

const onZoomChange = (val) => {

    const dom = flowContainerRef.value;
    if (!dom) {
        return
    }


    dom.style.transform = `scale(${val})`

    plumbService.plumbIns?.setZoom(val)


}


useKeydown((evt) => {

    const key = evt.key;

    switch (key) {
        case 'Backspace':
            doDeleteNodeOrLine()
            break;

        default:
            break;
    }
})

const viewConfig = () => {

    const formatter = new JSONFormatter({ nodes: data.nodes, connections: data.connections }, 3);

    const dom = configJSONRef.value
    if (dom) {
        dom.innerHTML = ""
        dom.appendChild(formatter.render());
    }




}



const copyConfig = () => {
    const config = {
        nodes: data.nodes,
        connections: data.connections,
    };

    console.log(config);

    copyToClipboard(JSON.stringify(config));
};

const data: {
    nodes: NodeConfig[];
    connections: any[];
    menus: any[];
    currentItem?: any;
    activeNode?: NodeConfig | null;
    activeLine?: LineConfig | null;
    zoom: number
} = reactive({
    // ...flowConfig,
    nodes: [],
    connections: [],
    menus: nodeTypeList,
    currentItem: null,
    activeNode: null,
    activeLine: null,
    zoom: 1
});

let plumbIns;

const getLineDataByLineInstance = (line) => {
    return data.connections.find((v) => {
        return (
            line.sourceId === v.source && line.targetId === v.target
        );
    })

}

const onCanvasClick = (event) => {
    event.preventDefault();

    plumbIns.getAllConnections().forEach((line) => {

        const labelEditor = line.getOverlay('LabelEditor');

        if (labelEditor.visible) {
            const lineData = getLineDataByLineInstance(line);
            if (lineData) {
                lineData.label = labelEditor.canvas.value;
                line.setLabel({ "label": lineData.label, "labelStyle": {}, "location": 0.5, "cssClass": "caiwf-line-label added-by-editor" })
            }

        };

    });

    console.log(JSON.parse(JSON.stringify(data.connections)))



    setActiveNode(null);

    setActiveLine(null);
};

const setActiveNode = (item) => {
    data.activeNode = item;

    if (item) {
        setActiveLine(null);
    }
};


const doCheckWorkFlow = () => {


    const errors = plumbService.checkWorkflowValidation({
        nodes: data.nodes,
        connections: data.connections,
        conditionValidate() {
            return null
        }
    })

    if (errors.nodes.length === 0 && errors.connections.length === 0) {

        ElMessage({
            message: '检测通过！',
            type: 'success',
            duration: 3000
        })

    }


    data.nodes.forEach(v => {
        const find = errors.nodes.find(vv => {
            return vv.node.id === v.id
        })
        if (find) {
            v.errors = find.errors
        } else {
            v.errors = undefined
        }
    })
}

const doAutoLayoutWorkFlow = () => {
    const config = plumbService.autoLayoutFlow({
        nodes: data.nodes,
        connections: data.connections
    })

    loadConfig(config)
}

const setActiveLine = (conn) => {
    let lineData;

    if (conn) {
        lineData = data.connections.find((v) => {
            const lineId = getConnectionId(conn)
            return v.id === lineId;
        });
    }

    data.activeLine = lineData;

    let lines = plumbIns.getAllConnections();

    lines.forEach((line) => {
        if (line.id === conn?.id) {
            line.canvas.classList.add("selected");
            line.getOverlay('LabelEditor').setVisible(true);
            // line.getOverlay('MyLabel').setVisible(false);
        } else {
            line.canvas.classList.remove("selected");
            line.getOverlay('LabelEditor').setVisible(false);
            // line.getOverlay('MyLabel').setVisible(true);
        }
    });

    if (conn) {
        setActiveNode(null);
    }

    // jsPlumb
};


const doClearAll = () => {
    updateMemory()

    clearAll();
}


/**
 * 删除所有
 * 
*/
const clearAll = () => {

    plumbService.clearAll()
    data.nodes = []

    return new Promise((resolve) => {
        nextTick(() => {
            resolve(true)
        })
    })
}

const loadConfigExample_2 = () => {


    loadConfig(flowConfig_example_a, true)

}

const loadConfigExample_3 = () => {
    loadConfig(flowConfig_example_b, true)
}

const loadConfigExample_1 = () => {

    loadConfig(deepCloneJSON(flowConfig), true)

}

let loadingNum = 0;

/**
 * 加载配置，绘出流程图
 * @param clearActive 是否清楚当前选中
 * 
*/
const loadConfig = async (config, clearActive = false) => {

    plumbService.setSuspendDrawing(true);

    // plumbIns.setSuspendDrawing(true, true);
    if (!plumbService.plumbIns) {
        throw new Error('plumbIns is null')
    }

    //在加载的时候阻止监听事件
    plumbService.setSuspendEvents(true)

    const currentLoadingNum = ++loadingNum


    await clearAll()

    data.nodes = config.nodes;

    data.connections = config.connections;

    if (clearActive) {
        data.activeLine = null;
        data.activeNode = null;
    }

    nextTick(async () => {
        await initNodes(data.nodes);

        await drawConnections(config.connections);

        plumbService.setSuspendDrawing(false);

        if (currentLoadingNum >= loadingNum) {
            plumbService.setSuspendEvents(false)
        }


    })

}

onUnmounted(() => {
    plumbService.destroy()
});



const { updateMemory, clearMemory, undo, redo } = useMemoryEffect({
    getData: () => {
        return {
            nodes: data.nodes,
            connections: data.connections
        }
    }
})

const doRedo = () => {


    const config = redo();


    if (!config) {
        console.log('没有历史记录')
        return;

    }

    console.log('redo', config)


    loadConfig(config)

}

const doUndo = () => {


    const config = undo();


    if (!config) {
        console.log('没有历史记录')
        return;

    }


    console.log('undo', config)


    loadConfig(config,)

}



const doDeleteNodeOrLine = () => {

    updateMemory()

    const activeLine = data.activeLine;

    //线
    if (activeLine) {
        const lineIns = plumbIns.getAllConnections().find((v) => {
            const lineId = getConnectionId(v);
            return lineId === activeLine.id;
        });

        plumbIns.deleteConnection(lineIns);
    }

    const activeNode = data.activeNode;

    //节点
    if (activeNode) {

        if (activeNode.type === 'start') {
            ElMessage({
                message: '不能删除起始节点',
                type: 'warning',
                duration: 0
            })

            return

        }

        if (activeNode.type === 'end') {
            ElMessage({
                message: '不能删除结束节点',
                type: 'warning',
            })

            return
        }


        const lines = plumbIns.getAllConnections();
        const deleteLines: any[] = [];

        //找到与节点相连的需要删除的线
        lines.forEach((line) => {
            const activeNodeId = activeNode.id;
            if (line.sourceId === activeNodeId || line.targetId === activeNodeId) {
                deleteLines.push(line);
            }
        });

        //删除线
        deleteLines.forEach((line) => {
            plumbIns.deleteConnection(line);
        });

        //维护连接线数据集
        data.connections = data.connections.filter((v) => {
            if (v.source === activeNode.id || v.target === activeNode.id) {
                return false;
            }

            return true;
        });

        //删除节点
        data.nodes = data.nodes.filter((v) => {
            return v.id !== activeNode.id;
        });
    }
};

const initJsPlumb = () => {
    plumbService.setContainerId("flow-container");

    plumbIns = plumbService.getInstance();



    plumbIns.importDefaults({ ...jsplumbSetting });

    plumbIns.unbind("connection");
    // 连线创建成功后，维护本地数据
    plumbIns.bind("connection", (evt) => {
        const data = evt.connection.getData();
        //如果data中没有id，就创建
        if (!data.id) {
            evt.connection.setData({
                ...data,
                id: uuid()
            })
        }

        addLine(evt.connection);
        console.log('add line', evt, data.connections)
    });

    // plumbService.bind()

    //   //连线双击删除事件
    //   this.jsPlumb.bind("dblclick",(conn, originalEvent) => {
    //     this.confirmDelLine(conn)
    //   })
    //断开连线后，维护本地数据
    plumbIns.bind("connectionDetached", (evt) => {
        deleteLineFromData(evt.connection);
        console.log('delete line', evt, data.connections);
    });

    plumbIns.bind("click", (conn, originalEvent) => {
        originalEvent.stopPropagation();
        setActiveLine(conn);
    });

    return new Promise((resolve) => {
        plumbIns.ready(() => {
            resolve(plumbIns)
        })
    })


}


/**
 * 
 * 绘制线
 * 
*/
const drawConnection = (line) => {
    const conn = plumbIns.connect(
        {
            id: line.id,
            // 对应上述基本概念
            source: line.source,
            target: line.target,
            label: line.label,
            data: {
                id: line.id
            },
            // ConnectionOverlays: [
            //     ["Label", { label: "1", id: "MyLabel", cssClass: "aLabel", location: 0.15, }],
            //     // ["Label", { label: "1", id: "label-2", cssClass: "aLabel", location: 0.85, }]
            // ],
            // anchor: ['Left', 'Right', 'Top', 'Bottom', [0.3, 0, 0, -1], [0.7, 0, 0, -1], [0.3, 1, 0, 1], [0.7, 1, 0, 1]],
            //@ts-ignore
            connector: ["Flowchart", { stub: [10, 50], midpoint: 0.5 }],
            // endpoint: 'Blank',
            // overlays: [
            //     ["Label", { label: "FOO", visible: true ,id: "MyLabel",}]
            // ]
            // ,

            // connectorOverlays: [
            //     // ["Arrow", { width: 10, length: 30, location: 1, id: "arrow" }],
            //     ["Label", { label: "foo", id: "MyLabel" }]
            // ],

            // overlay
            // // 添加样式
            // paintStyle: { stroke: '#909399', strokeWidth: 2 }, // connector
            // endpointStyle: { fill: '#909399', outlineStroke: '#606266', outlineWidth: 1 } // endpoint
        },
        jsplumbConnectOptions
    );

    if (line.label) {
        // conn.getOverlay("Label").setLabel(line.label);
    }
}

/**
 * 
 * 
*/
const drawConnections = (connections) => {


    connections.forEach((v) => {
        drawConnection(v)
    });
}

const initNodes = (nodes) => {

    const promises = nodes.map((v) => {
        return initNode(v);
    });

    return Promise.all(promises)

}

const getFlowConfig = async () => {
    return deepCloneJSON(flowConfig)
}

onMounted(async () => {



    const flowConfig = await getFlowConfig()

    await initJsPlumb()



    loadConfig(flowConfig)



});


const getConnectionId = (connection) => {
    return connection.getData().id;
}


const addLine = (connection) => {

    updateMemory()
    const id = connection.getData().id;

    if (!id) {
        throw new Error('id must not be null!')
    }

    data.connections.push({
        source: connection.source.id,
        target: connection.target.id,
        label: connection.getLabel(),
        id: id,
        remark: "",
    });
};

/**
 * 
 * 删除数据中的线
 * 
*/
const deleteLineFromData = (conn) => {
    data.connections = data.connections.filter((item) => {
        const lineId = getConnectionId(conn);
        return lineId !== item.id;
    });


};

const setNodeName = () => { };

const changeLineState = () => { };

const dragstart = (evt, menu) => {
    data.currentItem = menu;
};

const addNode = (params) => {
    updateMemory();

    data.nodes.push(params);
    initNode(params);
};

const initNode = (params) => {

    return new Promise((resolve) => {
        nextTick(() => {
            const nodeId = params.id;
            plumbIns.makeSource(nodeId, jsplumbSourceOptions);
            plumbIns.makeTarget(nodeId, jsplumbTargetOptions);


            plumbIns.draggable(nodeId, {
                containment: flowContainerRef.value?.id, //边界保护
                grid: [5, 5],
                drag: (params) => {
                    // this.alignForLine(nodeId, params.pos)
                },
                start: () => { },
                stop: (params) => {
                    const pos = params.pos;

                    updateMemory()

                    data.nodes.some((vv) => {
                        if (nodeId == vv.id) {
                            vv.pos.left = pos[0];
                            vv.pos.top = pos[1];
                            return true;
                        } else {
                            return false;
                        }
                    });


                },
            });

            resolve(true)
        });
    })

};

const onDrop = (event) => {
    const containerRect = plumbIns.getContainer().getBoundingClientRect();
    // const scale = this.getScale();
    let left = event.pageX - containerRect.left;
    let top = event.pageY - containerRect.top;
    const currentItem = data.currentItem as any;
    if (currentItem) {
        var temp = {
            type: currentItem.type,
            name: currentItem.name,
            id: uuid(),
            pos: {
                top: top - nodeHeight / 2,
                left: left - nodeWidth / 2,
            },
        };
        // this.
        addNode(temp);
    }
};

const allowDrop = (evt) => {
    evt.preventDefault();
    return true;
};

const { activeNode, activeLine, zoom } = toRefs(data);
</script>
