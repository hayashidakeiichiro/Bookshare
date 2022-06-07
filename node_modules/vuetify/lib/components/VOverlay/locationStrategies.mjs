// Utilities
import { computed, effectScope, nextTick, onScopeDispose, ref, watch, watchEffect } from 'vue';
import { convertToUnit, getScrollParent, IN_BROWSER, isFixedPosition, nullifyTransforms, oppositeAnchor, parseAnchor, physicalAnchor, propsFactory } from "../../util/index.mjs";
import { Box } from "../../util/box.mjs";
import { anchorToPoint, getOffset } from "./util/point.mjs"; // Types

const locationStrategies = {
  static: staticLocationStrategy,
  // specific viewport position, usually centered
  connected: connectedLocationStrategy // connected to a certain element

};
export const makeLocationStrategyProps = propsFactory({
  locationStrategy: {
    type: [String, Function],
    default: 'static',
    validator: val => typeof val === 'function' || val in locationStrategies
  },
  location: {
    type: String,
    default: 'bottom'
  },
  origin: {
    type: String,
    default: 'auto'
  },
  offset: [Number, String]
});
export function useLocationStrategies(props, data) {
  const contentStyles = ref({});
  const updateLocation = ref();
  let scope;
  watchEffect(async () => {
    var _scope;

    (_scope = scope) == null ? void 0 : _scope.stop();
    updateLocation.value = undefined;
    if (!(IN_BROWSER && data.isActive.value && props.locationStrategy)) return;
    scope = effectScope();
    await nextTick();
    scope.run(() => {
      if (typeof props.locationStrategy === 'function') {
        var _props$locationStrate;

        updateLocation.value = (_props$locationStrate = props.locationStrategy(data, props, contentStyles)) == null ? void 0 : _props$locationStrate.updateLocation;
      } else {
        var _locationStrategies$p;

        updateLocation.value = (_locationStrategies$p = locationStrategies[props.locationStrategy](data, props, contentStyles)) == null ? void 0 : _locationStrategies$p.updateLocation;
      }
    });
  });
  IN_BROWSER && window.addEventListener('resize', onResize, {
    passive: true
  });
  onScopeDispose(() => {
    var _scope2;

    IN_BROWSER && window.removeEventListener('resize', onResize);
    updateLocation.value = undefined;
    (_scope2 = scope) == null ? void 0 : _scope2.stop();
  });

  function onResize(e) {
    var _updateLocation$value;

    (_updateLocation$value = updateLocation.value) == null ? void 0 : _updateLocation$value.call(updateLocation, e);
  }

  return {
    contentStyles,
    updateLocation
  };
}

function staticLocationStrategy() {// TODO
}

function connectedLocationStrategy(data, props, contentStyles) {
  const activatorFixed = isFixedPosition(data.activatorEl.value);

  if (activatorFixed) {
    Object.assign(contentStyles.value, {
      position: 'fixed'
    });
  }

  const preferredAnchor = computed(() => parseAnchor(props.location));
  const preferredOrigin = computed(() => props.origin === 'overlap' ? preferredAnchor.value : props.origin === 'auto' ? oppositeAnchor(preferredAnchor.value) : parseAnchor(props.origin));
  const doesOverlap = computed(() => {
    return preferredAnchor.value.side === preferredOrigin.value.side;
  });
  const configuredMaxHeight = computed(() => {
    const val = parseFloat(props.maxHeight);
    return isNaN(val) ? Infinity : val;
  });
  const configuredMinWidth = computed(() => {
    const val = parseFloat(props.minWidth);
    return isNaN(val) ? Infinity : val;
  });
  let observe = false;

  if (IN_BROWSER) {
    const observer = new ResizeObserver(() => {
      if (observe) updateLocation();
    });
    observer.observe(data.activatorEl.value);
    observer.observe(data.contentEl.value);
    onScopeDispose(() => {
      observer.disconnect();
    });
  } // eslint-disable-next-line max-statements


  function updateLocation() {
    var _props$maxWidth;

    observe = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => observe = true);
    });
    const targetBox = data.activatorEl.value.getBoundingClientRect(); // TODO: offset shouldn't affect width

    if (props.offset) {
      targetBox.x -= +props.offset;
      targetBox.y -= +props.offset;
      targetBox.width += +props.offset * 2;
      targetBox.height += +props.offset * 2;
    }

    const scrollParent = getScrollParent(data.contentEl.value);
    const viewportWidth = scrollParent.clientWidth;
    const viewportHeight = Math.min(scrollParent.clientHeight, window.innerHeight);
    let contentBox;
    {
      const scrollables = new Map();
      data.contentEl.value.querySelectorAll('*').forEach(el => {
        const x = el.scrollLeft;
        const y = el.scrollTop;

        if (x || y) {
          scrollables.set(el, [x, y]);
        }
      });
      const initialMaxWidth = data.contentEl.value.style.maxWidth;
      const initialMaxHeight = data.contentEl.value.style.maxHeight;
      data.contentEl.value.style.removeProperty('max-width');
      data.contentEl.value.style.removeProperty('max-height');
      contentBox = nullifyTransforms(data.contentEl.value);
      contentBox.x -= parseFloat(data.contentEl.value.style.left) || 0;
      contentBox.y -= parseFloat(data.contentEl.value.style.top) || 0;
      data.contentEl.value.style.maxWidth = initialMaxWidth;
      data.contentEl.value.style.maxHeight = initialMaxHeight;
      scrollables.forEach((position, el) => {
        el.scrollTo(...position);
      });
    }
    const contentHeight = Math.min(configuredMaxHeight.value, contentBox.height); // Regard undefined maxWidth as maximally occupying whole remaining space by default

    const maxFreeSpaceWidth = props.maxWidth === undefined ? Number.MAX_VALUE : parseInt((_props$maxWidth = props.maxWidth) != null ? _props$maxWidth : 0, 10);
    const viewportMargin = 12;
    const freeSpace = {
      top: targetBox.top - viewportMargin,
      bottom: viewportHeight - targetBox.bottom - viewportMargin,
      left: Math.min(targetBox.left - viewportMargin, maxFreeSpaceWidth),
      right: Math.min(viewportWidth - targetBox.right - viewportMargin, maxFreeSpaceWidth)
    };
    const fitsY = preferredAnchor.value.side === 'bottom' && contentHeight <= freeSpace.bottom || preferredAnchor.value.side === 'top' && contentHeight <= freeSpace.top;
    const anchor = fitsY ? preferredAnchor.value : preferredAnchor.value.side === 'bottom' && freeSpace.top > freeSpace.bottom || preferredAnchor.value.side === 'top' && freeSpace.bottom > freeSpace.top ? oppositeAnchor(preferredAnchor.value) : preferredAnchor.value;
    const origin = fitsY ? preferredOrigin.value : oppositeAnchor(anchor);
    const canFill = doesOverlap.value || ['center', 'top', 'bottom'].includes(anchor.side);
    const maxWidth = canFill ? Math.min(viewportWidth, Math.max(targetBox.width, viewportWidth - viewportMargin * 2)) : anchor.side === 'end' ? freeSpace.right : anchor.side === 'start' ? freeSpace.left : null;
    const minWidth = Math.min(configuredMinWidth.value, maxWidth, targetBox.width);
    const maxHeight = fitsY ? configuredMaxHeight.value : Math.min(configuredMaxHeight.value, Math.floor(anchor.side === 'top' ? freeSpace.top : freeSpace.bottom));
    const targetPoint = anchorToPoint(anchor, targetBox);
    const contentPoint = anchorToPoint(origin, new Box({ ...contentBox,
      height: Math.min(contentHeight, maxHeight)
    }));
    const {
      x,
      y
    } = getOffset(targetPoint, contentPoint);
    Object.assign(contentStyles.value, {
      '--v-overlay-anchor-origin': physicalAnchor(anchor, data.activatorEl.value),
      top: convertToUnit(Math.round(y)),
      left: convertToUnit(Math.round(x)),
      // TODO: right for origin="end", rtl
      transformOrigin: physicalAnchor(origin, data.activatorEl.value),
      minWidth: convertToUnit(minWidth),
      maxWidth: convertToUnit(maxWidth),
      maxHeight: convertToUnit(maxHeight)
    });
  }

  watch(() => [preferredAnchor.value, preferredOrigin.value, props.offset], () => updateLocation(), {
    immediate: !activatorFixed
  });
  if (activatorFixed) nextTick(() => updateLocation());
  requestAnimationFrame(() => {
    if (contentStyles.value.maxHeight) updateLocation();
  });
  return {
    updateLocation
  };
}
//# sourceMappingURL=locationStrategies.mjs.map