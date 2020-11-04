define([
    'TYPO3/CMS/Mask/Contrib/vue',
    'TYPO3/CMS/Mask/Contrib/vuedraggable'
  ],
  function (Vue, draggable) {
    return Vue.component(
      'nested-draggable',
      {
        props: {
          fields: Array,
          icons: Object,
          global: Object,
          depth: Number,
          index: Number
        },
        components: {
          draggable
        },
        methods: {
          uuid(e) {
            if (e.uid) {
              return e.uid;
            }
            const key = Math.random()
              .toString(16)
              .slice(2);

            this.$set(e, 'uid', key);

            return e.uid;
          },
          removeField: function (index) {
            if (this.fields[index - 1]) {
              this.global.activeField = this.fields[index - 1];
            } else if (this.fields[index + 1]) {
              this.global.activeField = this.fields[index + 1];
            }
            this.fields.splice(index, 1);
            if (this.fields.length === 0) {
              if (this.depth > 0) {
                this.$emit('set-parent-active', this.index);
              } else {
                this.global.activeField = {};
              }
            }
          },
          setParentActive(index) {
            this.global.activeField = this.fields[index];
          },
          isParentField: function (field) {
            return ['inline', 'palette'].includes(field.name);
          }
        },
        template: `
<draggable
    tag="ul"
    class="tx_mask_fieldtypes dragtarget"
    :list="fields"
    group="fieldTypes"
    ghost-class="ghost"
    @add="global.activeField = global.clonedField"
  >
  <li v-for="(field, index) in fields" :key="uuid(field)" :class="['tx_mask_btn', {active: global.activeField == field }, 'id_' + field.name]">
    <div class="tx_mask_btn_row" @click="global.activeField = field">
        <div class="tx_mask_btn_img">
            <div v-html="field.icon"></div>
        </div>
        <div class="tx_mask_btn_text">
          <span class="id_labeltext">{{ field.label }}</span>
          <span class="id_keytext">{{ field.key }}</span>
        </div>
        <div class="tx_mask_btn_actions">
            <span @click.stop="removeField(index)" class="id_delete" title="Delete item" v-html="icons.delete"></span>
            <span class="id_move" title="Move item" v-html="icons.move"></span>
        </div>
    </div>
    <div class="tx_mask_btn_caption" v-if="isParentField(field)">
        <nested-draggable @set-parent-active="setParentActive($event)" :depth="depth + 1" :index="index" :fields="field.fields" :icons="icons" :global="global"/>
    </div>
  </li>
</draggable>
        `
      }
    )
  }
);