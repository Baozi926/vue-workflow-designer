<template>
    <div ref="nodeDom" :id="node.id" class="node-item-wrapper" @mouseenter="showAnchor" @mouseleave="hideAnchor">

        <div :class="['node-type-' + (node.type || 'node'), 'content', isActive ? 'active' : '', hasError ? 'error' : '']">
            <div class="start">
                <el-icon v-if="node.type === 'start'">

                    <UserFilled />
                </el-icon>
                <el-icon v-else-if="node.type === 'end'">
                    <VideoPause />
                </el-icon>
                <el-icon v-else-if="node.type === 'sendCopy'">
                    <Promotion />
                </el-icon>
                <el-icon v-else>
                    <UserFilled />
                </el-icon>
            </div>
            <div class="main">
                {{ node.name }}
            </div>
            <div class="end">
                <div v-if="node.errors && node.errors.length" class="errors">
                    <el-tooltip placement="top">
                        <template #content>
                            <div class="error-msg" v-for=" error  in  node.errors ">{{ transErrorMsg(error) }}</div>
                        </template>
                        <el-icon class="error">
                            <WarningFilled />
                        </el-icon>
                    </el-tooltip>
                </div>

            </div>


        </div>
        <template v-if="!['sendCopy', 'end'].includes(node.type)">
            <div v-show="isInnerPointShow" class="node-anchor inner anchor-top-inner"></div>
            <div v-show="isInnerPointShow" class="node-anchor inner anchor-right-inner"></div>
            <div v-show="isInnerPointShow" class="node-anchor inner anchor-bottom-inner"></div>
            <div v-show="isInnerPointShow" class="node-anchor inner anchor-left-inner"></div>
        </template>

        <template v-if="!['sendCopy', 'end'].includes(node.type)">
            <div v-show="isActive" class="node-anchor outer anchor-top"> <span>+</span></div>
            <div v-show="isActive" class="node-anchor outer anchor-right"><span>+</span></div>
            <div v-show="isActive" class="node-anchor outer anchor-bottom"><span>+</span></div>
            <div v-show="isActive" class="node-anchor outer anchor-left"><span>+</span></div>
        </template>
    </div>
</template>
<script setup lang="ts">

import { defineProps, onMounted, reactive, toRef, ref, computed } from 'vue'

import { Promotion, VideoPause, UserFilled, WarningFilled } from '@element-plus/icons-vue'
import { NodeConfig, NodeError } from './types';

const nodeDom = ref<any>(null);



const data = reactive({
    mouseEnter: false
})



const props = defineProps({
    node: Object,
    isActive: Boolean
})

const node: NodeConfig = props.node as NodeConfig;

let isInnerPointShow = computed({
    get: () => { return !props.isActive && data.mouseEnter },
    set: () => {
    }
})

const hasError = computed({
    get: () => {
        if (node.errors && node.errors.length) {
            return true
        }
        return false
    },
    set() { }
})





const pos = props.node?.pos || { left: 0, top: 0 }

onMounted(() => {
    const dom = nodeDom.value

    if (!dom) {
        return
    }

    dom.style.left = pos.left + 'px';
    dom.style.top = pos.top + 'px'

})


const showAnchor = () => {
    data.mouseEnter = true

}
const hideAnchor = () => {
    data.mouseEnter = false
}

const transErrorMsg = (error: NodeError) => {

    switch (error) {
        case NodeError.noStart:
            return '没有连接到开始节点'
        case NodeError.noEnd:
            return '没有连接到结束节点'
        default:
            return '未知的错误';
    }

}

// const { mouseEnter } = toRefs(data)

</script>


<style lang="less" scoped>
@labelColor: #409eff;
@nodeSize: 12px;
@nodeSizeInner: 6px;
@viewSize: 10px;
@anchorMargin: 14px;



.node-item-wrapper {


    .errors {
        .error {
            color: red;
        }

    }

    box-sizing: content-box;

    position: relative;
    position: absolute;
    display: flex;
    height: 40px;
    width: 160px;
    justify-content: center;
    align-items: center;
    // border: 1px solid #b7b6b6;
    border-radius: 4px;
    cursor: move;
    box-sizing: content-box;
    z-index: 2000;

    // border-color: transparent;

    .content {

        overflow: hidden;

        &.node-type-start {
            .start {
                color: green;
            }

            border-radius: 20px;
        }

        &.node-type-end {
            .start {
                color: grey;
            }

            border-radius: 20px;
        }

        &.node-type-sendCopy {
            .start {
                color: rgb(230, 129, 5);
            }

            // border-radius: 20px;
        }


        display: flex;
        align-items: center;
        // justify-content: center;
        cursor: move;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 5px;
        display: flex;
        background: #fff;
        box-shadow: rgba(6, 30, 53, 0.1) 0px 1px 2px 1px;
        color: black;

        .start {
            color: rgb(48, 130, 242);
            padding: 0 10px;
            display: flex;
            align-items: center;
            justify-content: center;

        }

        .main {
            display: block;
            flex: 1;
            overflow: hidden;
            white-space: nowrap;
            /* 第三步：用省略号来代表未显示完的文本 */
            text-overflow: ellipsis;
            text-align: left;
        }

        .end {
            width: 30px;

            display: flex;
            align-items: center;
            justify-content: center;
        }

        &:hover {
            border: 1px solid rgb(48, 130, 242);
            z-index: 2000;
            border-width: 1px;
            box-shadow: 0 0 0 3px rgba(48, 129, 242, .2);
        }

        &.active {
            border: 2px solid rgb(48, 130, 242);
        }

        &.error {
            border: 1px solid red;
        }

    }

    &:hover {
        z-index: 2000;

        .delete-btn {
            display: block;
        }
    }

    .log-wrap {
        width: 40px;
        height: 40px;
        border-right: 1px solid #b7b6b6;
    }

    .nodeName {
        flex-grow: 1;
        width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .node-anchor {
        z-index: 2000;
        cursor: crosshair;

        &.outer {
            display: flex;
            position: absolute;
            width: @nodeSize;
            height: @nodeSize;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #98c8f7;

            &:hover {
                background: #409eff;
            }
        }

        &.inner {
            display: flex;
            position: absolute;
            width: @nodeSizeInner;
            height: @nodeSizeInner;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #fff;
            border: 2px solid #409eff;
        }


        span {
            pointer-events: none;
            height: 10px;
            width: 10px;
            line-height: 7px;
        }

        // background: -webkit-radial-gradient(sandybrown 10%, white 30%, #9a54ff 60%);
    }



    .anchor-top {
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
        // margin-left: calc((@nodeSize/2)*-1);
        // margin-top: -@anchorMargin;

        margin-top: calc(@anchorMargin * -1);
    }

    .anchor-top-inner {
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .anchor-right {
        top: 50%;
        transform: translate(50%, -50%);
        right: 0;
        margin-right: calc(@anchorMargin * -1);
    }

    .anchor-right-inner {
        top: 50%;
        right: 0;
        transform: translate(50%, -50%);

    }

    .anchor-bottom {
        transform: translate(-50%, 50%);
        bottom: 0;
        left: 50%;
        margin-bottom: calc(@anchorMargin * -1);
    }

    .anchor-bottom-inner {
        bottom: 0;
        left: 50%;
        transform: translate(-50%, 50%);
        // margin-left: calc((@nodeSizeInner / 2)*-1);
    }

    .anchor-left {
        top: 50%;
        left: 0;
        transform: translate(-50%, -50%);
        margin-left: calc(@anchorMargin * -1);
        // margin-top: calc((@nodeSize / 2)*-1);
    }

    .anchor-left-inner {
        top: 50%;
        left: 0;
        transform: translate(-50%, -50%);
        // margin-top: calc((@nodeSizeInner / 2)*-1);
    }
}

.active {
    border: 1px dashed @labelColor;
    box-shadow: 0px 5px 9px 0px rgba(0, 0, 0, 0.5);
}
</style>