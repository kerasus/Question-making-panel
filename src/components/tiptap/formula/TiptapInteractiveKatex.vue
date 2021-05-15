<template>
    <node-view-wrapper class="vue-component">
        <span class="label">Vue Component</span>

        <div class="content">
            <div v-html="katex" />
            <button @click="increase">
                This button has been clicked {{ node.attrs.count }} times.
            </button>
        </div>
    </node-view-wrapper>
</template>

<script>
  import {mixinMarkdownAndKatex} from '@/mixin/Mixins'
  import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-2'

  export default {
    components: {
      NodeViewWrapper,
    },
    mixins: [mixinMarkdownAndKatex],
    props: nodeViewProps,
    data: () => {
      return {
        katex: '$$x=\\frac{-b\\pm\\sqrt[]{b^2-4ac}}{2a}$$'
      }
    },
    mounted() {
      this.katex = this.markdown.render(this.katex)
    },
    methods: {
      increase() {
        this.updateAttributes({
          count: this.node.attrs.count + 1,
        })
      },
    },
  }
</script>


<style lang="scss" scoped>
    .vue-component {
        background: #FAF594;
        border: 3px solid #0D0D0D;
        border-radius: 0.5rem;
        margin: 1rem 0;
        position: relative;
    }

    .label {
        margin-left: 1rem;
        background-color: #0D0D0D;
        font-size: 0.6rem;
        letter-spacing: 1px;
        font-weight: bold;
        text-transform: uppercase;
        color: #fff;
        position: absolute;
        top: 0;
        padding: 0.25rem 0.75rem;
        border-radius: 0 0 0.5rem 0.5rem;
    }

    .content {
        margin-top: 1.5rem;
        padding: 1rem;
    }
</style>