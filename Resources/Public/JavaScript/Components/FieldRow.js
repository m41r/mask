define([
    'TYPO3/CMS/Mask/Contrib/vue',
    'TYPO3/CMS/Backend/Tooltip',
    'jquery'
  ],
  function (Vue, Tooltip, $) {
    return Vue.component(
      'fieldRow',
      {
        props: {
          global: Object,
          fields: Array,
          field: Object,
          language: Object,
          icons: Object,
          index: Number
        },
        mounted: function () {
          Tooltip.initialize('[data-bs-toggle="tooltip"]', {
            delay: {
              'show': 50,
              'hide': 50
            },
            trigger: 'hover',
            container: '#mask'
          });
        },
        methods: {
          hideTooltip() {
            Tooltip.hide($(this.$refs['row' + this.index]));
          },
          keyWithoutMask: function (key) {
            if (key.substr(0, 8) === this.global.maskPrefix) {
              return key.substr(8);
            } else {
              return key;
            }
          }
        },
        template: `
    <div class="tx_mask_btn_row" @click="global.activeField = field; global.currentTab = 'general'">
        <div class="tx_mask_btn_img">
            <div v-html="field.icon"></div>
        </div>
        <div class="mask-field__body">
          <div class="tx_mask_btn_text">
            <span v-if="field.name == 'linebreak'" class="id_labeltext">Linebreak</span>
            <span v-else class="id_labeltext">{{ field.label }}</span>
            <span class="id_keytext" v-if="!global.sctructuralFields.includes(field.name)">{{ keyWithoutMask(field.key) }}</span>
          </div>
          <div class="tx_mask_btn_actions">
              <a class="btn btn-default btn-sm" @click.stop="$emit('remove-field', index); hideTooltip();" data-bs-toggle="tooltip" :data-title="language.tooltip.deleteField" v-html="icons.delete" :ref="'row' + index"></a>
          </div>
        </div>
    </div>
        `
      }
    )
  }
);