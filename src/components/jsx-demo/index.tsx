import { DefineComponent, defineComponent, ref, onMounted } from 'vue';
// import { particlesCursor } from 'runafe-threejs';
// import { ThreeJs } from 'runafe-threejs';

export interface Props {
  count?: number;
}

/**
 * JsxDemo.
 */
export const JsxDemo = defineComponent({
  name: 'FileTabs',
  inheritAttrs: true,
  props: {
    count: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  setup(props: Props) {
    const root = ref<any>();
    onMounted(() => {
      // new ThreeJs({
      //   container: root.value,
      //   model: {
      //     src: '/gltf/scene22824.glb',
      //     DBid: '/gltf/scene22824.glb',
      //   },
      //   texture: {
      //     environmentMap: '/textures/venice_sunset_1k.hdr',
      //   },
      // });
    });
    return () => <div ref={root} class = "swarm"></div>;
  },
}) as DefineComponent<Props>;
