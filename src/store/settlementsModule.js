import SettlementsJsonFile from '@/data/bolgar_settlements.json';
// import {createItemFromDescriptor} from "@babel/core/lib/config/item";
export const settlementsModule = {
    state: () => ({
        raw_objs: [],
        crs: null,
        current_obj: null,
        objs: [],
        scheme: [
            {attr_name: 'id', title: 'id', inTable: 1, inDetails: 0, filterType: 'none', order: 10},
            {attr_name: 'name', title: 'Наименование', inTable: 1, inDetails: 1, filterType: 'find', order: 20},
            {attr_name: 'region', title: 'Регион', inTable: 1, inDetails: 1, filterType: 'dropdown', order: 30,
                valueAliases: [{value: 'PV', alias: 'Предволжье'}, {value: 'PK', alias: 'Предкамье'}, {value: 'ZK', alias: 'Закамье'}]},
            {attr_name: 'dating', title: 'Датировка', inTable: 1, inDetails: 1, filterType: 'dropdown', order: 40},
            {attr_name: 'location', title: 'Местоположение', inTable: 0, inDetails: 1, filterType: 'none', order: 100},
            {attr_name: 'area', title: 'Площадь', inTable: 1, inDetails: 1, filterType: 'range', order: 80},
            {attr_name: 'typesettlement', title: 'Тип', inTable: 1, inDetails: 1, filterType: 'dropdown', order: 110},
            {attr_name: 'form', title: 'Форма', inTable: 0, inDetails: 1, filterType: 'none', order: 90},
            {attr_name: 'literature', title: 'Литература', inTable: 0, inDetails: 1, filterType: 'none', order: 60},
            {attr_name: 'description', title: 'Описание', inTable: 0, inDetails: 0, filterType: 'none', order: 50},
            {attr_name: 'type', title: 'Тип', inTable: 0, inDetails: 0, filterType: 'none', order: 70},
            {attr_name: 'sketchfab', title: '3d', inTable: 0, inDetails: 1, filterType: 'none', order: 120},
            {attr_name: 'coordinates', title: 'Координаты', inTable: 0, inDetails: 1, filterType: 'none', order: 130},
        ],

    }),
    getters:
        {
            titlesTable(state) {
                let titles = [];
                state.scheme.forEach((item) => {
                    if (item.inTable === 1) {
                        titles.push({attr_name: item.attr_name, title_name: item.title})
                    }
                });
                return titles;
            },

            rows(state) {
                let titles = [];
                state.scheme.forEach((item) => {
                    if (item.inTable === 1) {
                        titles.push(item.attr_name)
                    }
                });
                let rows = [];
                state.objs.forEach((item) => {
                    let row = new Object();
                    titles.forEach((key) => {
                        row[key] = item[key]
                    });
                    rows.push(row);
                })
                return rows
            },

            details(state) {
                if (!(state.current_obj == null)) {
                    let titlesAndValues = [];

                    state.scheme.forEach((item) => {
                        if (item.inDetails === 1) {
                            titlesAndValues.push({
                                attr_name: item.attr_name,
                                title_name: item.title,
                                value: state.current_obj[item.attr_name]
                            });
                        }
                    });
                    return titlesAndValues
                }
            },

            filters(state) {
                let filters = [];
                state.scheme.forEach((attr) => {
                   if (attr.filterType === 'dropdown') {
                       let lV = [];
                       state.objs.forEach(obj => {
                               if ((obj[attr.attr_name] != null) && (obj[attr.attr_name] != '') && !lV.includes(obj[attr.attr_name])) {
                               lV.push(obj[attr.attr_name]);
                           }
                       }
                       )
                       filters.push({attr_name: attr.attr_name, title_name: attr.title, listValue: lV.sort()});
                   }
                });
                return filters;
            }

        },
    mutations: {
        setRAWSettlements(state, raw_settlements) {
            state.raw_objs = raw_settlements;
        },
        setSettlements(state, settlements) {
            state.objs = settlements.map((item) => {
                return {
                    id: item.properties.id,
                    name: item.properties.name,
                    region: item.properties.region,
                    dating: item.properties.dating,
                    description: item.properties.description,
                    literature: item.properties.literature,
                    type: item.properties.type,
                    area: item.properties.area,
                    form: item.properties.form,
                    location: item.properties.location,
                    typesettlement: item.properties.typesettlement,
                    sketchfab: item.properties.sketchfab,
                    coordinates: item.geometry.coordinates,
                }
            });
        },
        setCRS(state, crs) {
            state.crs = crs;
        },
        setTitleTableOn(state, name) {
            state.scheme.forEach ((item) => {if (item['attr_name'] === name ) {item['inTable'] === 1}});
        },
        setTitleTableOff(state, name) {
            state.scheme.forEach ((item) => {if (item['attr_name'] === name ) {item['inTable'] === 0}});

        },
        setCurrentObjFromRow(state, row) {
            //найти объект в общем списке, который соответствует присланной строке
            state.current_obj = [...state.objs].filter(item=>{
                if ((item.name === row.name) && (item.id === row.id)) {return item}
            })[0];

        }
    },
    actions: {
        loadSettlements({commit}) {
            try {
                const response = SettlementsJsonFile;
                commit('setRAWSettlements', response);
                commit('setCRS', response.crs);
                commit('setSettlements', response.features);
            } catch (e) {
                alert('Ошибка загрузки файла');
            }
        },


    },
    namespaced: true,
}
