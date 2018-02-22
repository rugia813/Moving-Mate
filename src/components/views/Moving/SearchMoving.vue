<template>

  <div class='main'>
    <div class='search-container'>
      <div class='search-wrapper'>
        <!-- <FormButton v-if='isCompatible' 
          @click='getUserLocation'> 
            L
        </FormButton> -->
        <div class='search-box' :class='{searching}'>
          <transition name='slide-top'>
            <div class='searchResults' v-if='placesResultsDisplay && formSearchValue.length > 0 && !searchCommited'>
              <ul v-if='placesResults.length'>
                <li v-for='(result, index) in placesResults' 
                    :key='result.code'
                    :class='{selected: index == resultSelected}'>
                  <div class='icon'>
                    <SvgIcon v-if='result.type =="ville"' 
                      :src="require('@icons/location.svg')" 
                      :color="{white: index == resultSelected}"/>
                    <SvgIcon v-else 
                      :src="require('@icons/region.svg')" 
                      :color="{white: index == resultSelected}"/>
                  </div>
                  <span class='name'>{{result.nom}}</span>
                  <span class='code' v-if='result.codesPostaux'>
                    {{result.codesPostaux[0]}}
                  </span>
                </li>
              </ul>
              <div v-if='!placesResults.length && !searching' class='no-result'>
                Aucun résultat ☹️
              </div>
            </div>
          </transition>

          <input ref='inputField' type="text"
            class='inputSearchField'
            placeholder="Région, departement, ville"
            :value='formSearchValue'
            @blur='hideResults()'
            @focus='showResults()'
            @keydown.down.up.prevent="modifySelected($event)"
            @keydown.esc.prevent='hideResults()'
            @keydown.enter.prevent="handleNewSearch()"
            @input="handlePlacesSearch($event.target.value)"
            v-focus>

          <div class='icon-contain'>
            <SvgIcon :src="require('@icons/search.svg')"/>
          </div>

          <transition name='fade'>
            <img v-if='searching' class='loading' src='~@images/loading.svg'>
          </transition>

        </div>
      </div>
    </div>
    <div class='search-options'></div>
  </div>

</template>

<script lang="ts">
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator'
import {FormButton, SvgIcon} from '@components';
import { debounce } from 'lodash';
import { Watch } from 'vue-property-decorator';
import axios from 'axios';
import { MovingStore } from '@store';

@Component({
  components: {
    FormButton, SvgIcon
  },
  directives: {
    focus: {
      inserted(el, binding, vnode) {
        el.focus();
      }
    } 
  },
})
export default class SearchMoving extends Vue {

  get formSearchValue() {return MovingStore.state.formSearchData.formSearchValue}
  get placesResults() {return MovingStore.state.formSearchData.placesResults}
  get searchCommited() {return MovingStore.state.formSearchData.searchCommited}
  public placesResultsDisplay = false;
  public handlePlacesSearch = null;
  public searching = false;
  public resultSelected = 0;
  public css = require('@css');

  get isCompatible() {
    return !!navigator.geolocation;
  }

  hideResults() {
    this.placesResultsDisplay = false;
    this.$refs['inputField'].blur();
  }
  showResults() {
    this.placesResultsDisplay = true;
  }

  modifySelected(event: KeyboardEvent) {
    let touche = event.which - 39;
    if ((this.resultSelected + touche >= 0 && (this.resultSelected + touche <= (this.placesResults.length - 1)))) {
      this.resultSelected += touche;
    }
  }

  getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          console.log(position.coords);
        });
    }
  }

  @Watch('formSearchValue') 
  async getResultsFromApi(newVal:string, oldVal:string) {
    if (newVal.trim().length > 0) {
      this.searching = true;
      await MovingStore.actions.fetchPlaces(newVal);
    } else {
      MovingStore.mutations.updateSearchList([]);
    }
    this.searching = false;
  }

  created() {
    this.handlePlacesSearch = debounce(e => {
      MovingStore.mutations.updateSearchValue(e);
    }, 500)
  }

}
</script>


<style lang="scss" scoped>

.main {
  display: flex;
  flex-flow: columns nowrap;
  width: 100%;

  .search-container {
    position: relative;
    display: flex;
    width: 100%;
    flex-flow: row wrap;
    justify-content: center;
    padding: 15px 20px 15px 20px;
    align-items: center;
    color: $g70;

    .search-wrapper {
      display: flex;
      flex: 0 0 auto;

      .search-box {
        display: flex;
        position: relative;
        flex-flow: row wrap;
        justify-content: center;

        &.searching {
          .inputSearchField {
            padding-right: 60px;
          }
        }

        .loading {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 15px;
          height: 25px;
          width: 25px;
        }

        &:before {
          width: 100%;
          height: 100%;
          left: 0;
          bottom: -4px;
          background-color: #EDEFF5;
          position: absolute;
          content: "";
          border-radius: 5px;
        }

        .inputSearchField {
          position: relative;
          background-color: white;
          color: $g70;
          height: 60px;
          padding: 5px 10px 5px 60px;
          width: 400px;
          line-height: 30px;
          font-size: 20px;
          border-radius: 4px;
          box-shadow: 0 0 15px rgba(0,0,0,0.15);
          
        }

        .icon-contain {
          position: absolute;
          left: 0;
          top: 0;
          width: 50px;
          height: calc(100% - 26px);
          margin-top: 13px;
          margin-bottom: 13px;
          margin-left: 5px;
          display: flex;
          justify-content: center;
          align-items: center;

          /deep/ svg {
            fill: $g90;
            height: 26px;
            width: 26px;
          }
        }

        .searchResults {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          background-color: white;
          display: flex;
          width: 100%;
          border-radius: 5px;
          z-index: 2;
          box-shadow: 0 0 15px rgba(0,0,0,0.15);

          &:before {
            width: 100%;
            height: 100%;
            left: 0;
            bottom: -4px;
            z-index: 0;
            background-color: #EDEFF5;
            position: absolute;
            content: "";
            border-radius: 5px;
          }

          ul {
            display: flex;
            width: 100%;
            z-index: 1;
            border-radius: 5px;
            overflow: hidden;
            flex-flow: column wrap;

            li {
              display: flex;
              flex-flow: row nowrap;
              height: 45px;
              align-items: center;
              background-color: white;
              &:not(:last-child) {
                border-bottom: 1px solid $w240;
              }

              &.selected {
                background-color: $mainStyle;
                color: white;
                .code {
                  color: $w240;
                }
              }

              .icon {
                display: flex;
                flex: 0 0 auto;
                justify-content: center;
                align-items: center;
                width: 60px;
              }

              .name {
                flex: 1 1 auto;
              }

              .code {
                flex: 0 0 auto;
                color: $w150;
                padding: 0 10px 0 10px;
                font-size: 15px; 
              }
            }
          }

          .no-result {
            height: 60px;
            border-radius: 5px;
            display: flex;
            background-color: white;
            flex: 1 1 auto;
            z-index: 2;
            flex-flow: row nowrap;
            justify-content: center;
            align-items: center;
            font-size: 19px;
          }

        }
      }
    }
  }
}


.slide-top-enter-active,
.slide-top-leave-active {
  transition: all 0.3s;
}
.slide-top-enter, .slide-top-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}


</style>
