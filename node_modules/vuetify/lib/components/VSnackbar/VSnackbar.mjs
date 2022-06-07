import { mergeProps as _mergeProps, resolveDirective as _resolveDirective, createVNode as _createVNode } from "vue";
// Styles
import "./VSnackbar.css"; // Components

import { VDefaultsProvider } from "../VDefaultsProvider/index.mjs";
import { VOverlay } from "../VOverlay/index.mjs"; // Composables

import { makePositionProps, usePosition } from "../../composables/position.mjs";
import { useProxiedModel } from "../../composables/proxiedModel.mjs";
import { makeTransitionProps } from "../../composables/transition.mjs";
import { genOverlays, makeVariantProps, useVariant } from "../../composables/variant.mjs"; // Utilities

import { onMounted, watch } from 'vue';
import { defineComponent, useRender } from "../../util/index.mjs";
import { makeRoundedProps, useRounded } from "../../composables/rounded.mjs";
import { makeLocationProps, useLocation } from "../../composables/location.mjs";
import { useScopeId } from "../../composables/scopeId.mjs";
export const VSnackbar = defineComponent({
  name: 'VSnackbar',
  props: {
    app: Boolean,
    contentClass: {
      type: String,
      default: ''
    },
    multiLine: Boolean,
    timeout: {
      type: [Number, String],
      default: 5000
    },
    vertical: Boolean,
    modelValue: Boolean,
    ...makeLocationProps({
      location: 'bottom'
    }),
    ...makePositionProps(),
    ...makeRoundedProps(),
    ...makeVariantProps(),
    ...makeTransitionProps({
      transition: 'v-snackbar-transition'
    })
  },
  emits: {
    'update:modelValue': v => true
  },

  setup(props, _ref) {
    let {
      slots
    } = _ref;
    const isActive = useProxiedModel(props, 'modelValue');
    const {
      locationStyles
    } = useLocation(props);
    const {
      positionClasses
    } = usePosition(props);
    const {
      scopeId
    } = useScopeId();
    const {
      colorClasses,
      colorStyles,
      variantClasses
    } = useVariant(props);
    const {
      roundedClasses
    } = useRounded(props);
    watch(isActive, startTimeout);
    watch(() => props.timeout, startTimeout);
    onMounted(() => {
      if (isActive.value) startTimeout();
    });
    let activeTimeout = -1;

    function startTimeout() {
      window.clearTimeout(activeTimeout);
      const timeout = Number(props.timeout);
      if (!isActive.value || timeout === -1) return;
      activeTimeout = window.setTimeout(() => {
        isActive.value = false;
      }, timeout);
    }

    function onPointerenter() {
      window.clearTimeout(activeTimeout);
    }

    useRender(() => {
      var _slots$default, _slots$actions;

      return _createVNode(VOverlay, _mergeProps({
        "modelValue": isActive.value,
        "onUpdate:modelValue": $event => isActive.value = $event,
        "class": ['v-snackbar', {
          'v-snackbar--active': isActive.value,
          'v-snackbar--multi-line': props.multiLine && !props.vertical,
          'v-snackbar--vertical': props.vertical
        }, positionClasses.value],
        "style": [colorStyles.value],
        "contentProps": {
          style: locationStyles.value
        },
        "persistent": true,
        "noClickAnimation": true,
        "scrim": false,
        "scrollStrategy": "none",
        "transition": props.transition
      }, scopeId), {
        default: () => [_createVNode("div", {
          "class": ['v-snackbar__wrapper', colorClasses.value, roundedClasses.value, variantClasses.value],
          "onPointerenter": onPointerenter,
          "onPointerleave": startTimeout
        }, [genOverlays(false, 'v-snackbar'), slots.default && _createVNode("div", {
          "class": ['v-snackbar__content', props.contentClass],
          "role": "status",
          "aria-live": "polite"
        }, [(_slots$default = slots.default) == null ? void 0 : _slots$default.call(slots)]), slots.actions && _createVNode(VDefaultsProvider, {
          "defaults": {
            VBtn: {
              variant: 'text',
              ripple: false
            }
          }
        }, {
          default: () => [_createVNode("div", {
            "class": "v-snackbar__actions"
          }, [(_slots$actions = slots.actions) == null ? void 0 : _slots$actions.call(slots)])]
        })])],
        activator: slots.activator
      });
    });
  }

});
//# sourceMappingURL=VSnackbar.mjs.map