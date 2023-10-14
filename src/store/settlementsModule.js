import SettlementsJsonFile from '@/data/bolgar_settlements.json';
// import {createItemFromDescriptor} from "@babel/core/lib/config/item";
export const settlementsModule = {
    state: () => ({
        crs: null,
        current_obj: null,
        objs: [],
        filtersValues: [],
        scheme: [
            {attrName: 'id', title: 'id', inTable: 1, inDetails: 0, filterType: 'none', order: 10},
            {attrName: 'name', title: 'Наименование', inTable: 1, inDetails: 1, filterType: 'input', order: 20},
            {
                attrName: 'region', title: 'Регион', inTable: 1, inDetails: 1, filterType: 'dropdown', order: 30,
                altValues: [{value: 'PV', alias: 'Предволжье'}, {value: 'PK', alias: 'Предкамье'}, {
                    value: 'ZK',
                    alias: 'Закамье'
                }]
            },
            {attrName: 'dating', title: 'Датировка', inTable: 1, inDetails: 1, filterType: 'dropdown', order: 40},
            {attrName: 'location', title: 'Местоположение', inTable: 0, inDetails: 1, filterType: 'none', order: 100},
            {attrName: 'area', title: 'Площадь', inTable: 1, inDetails: 1, filterType: 'range', order: 80},
            {attrName: 'typesettlement', title: 'Тип', inTable: 1, inDetails: 1, filterType: 'dropdown', order: 110},
            {attrName: 'form', title: 'Форма', inTable: 0, inDetails: 1, filterType: 'none', order: 90},
            {attrName: 'literature', title: 'Литература', inTable: 0, inDetails: 1, filterType: 'none', order: 60},
            {attrName: 'description', title: 'Описание', inTable: 0, inDetails: 0, filterType: 'none', order: 50},
            {attrName: 'type', title: 'Тип', inTable: 0, inDetails: 0, filterType: 'none', order: 70},
            {attrName: 'sketchfab', title: '3d', inTable: 0, inDetails: 1, filterType: 'none', order: 120},
            {attrName: 'coordinates', title: 'Координаты', inTable: 0, inDetails: 1, filterType: 'none', order: 130},
        ],

    }),
    getters:
        {
            cols(state) {
                let cols = [];
                state.scheme.forEach((item) => {
                    if (item.inTable === 1) {
                        cols.push({attrName: item.attrName, titleName: item.title})
                    }
                });
                return cols;
            },

            rows(state) {
                let cols = [];
                state.scheme.forEach((item) => {
                    if (item.inTable === 1) {
                        cols.push(item.attrName)
                    }
                });
                let rows = [];
                state.objs.forEach((item) => {
                    //проверить item на соответствие значениям фильтров
                    let filterPass = true;
                    state.filtersValues.forEach((fV) => {
                        // if (!(
                        //     (((fV.value === item[fV.attrName]) || (fV.value == null)))
                        // ))
                        if (!(
                            ((fV.type === 'dropdown') && ((fV.value === item[fV.attrName]) || (fV.value == null))) ||
                            ((fV.type === 'input') && (fV.value == null) || (fV.value === '')
                                || ((item[fV.attrName] != null ? item[fV.attrName] : '').toLowerCase().includes((fV.value != null ? fV.value : '').toLowerCase(), 0)))
                        ))
                        {
                            filterPass = false;
                        }
                    });
                    //сформировать строку
                    if (filterPass) {
                        let row = new Object();
                        cols.forEach((key) => {
                            row[key] = item[key]
                        });
                        rows.push(row);
                    }
                })
                return rows
            },

            details(state) {
                if (!(state.current_obj == null)) {
                    let titlesAndValues = [];

                    state.scheme.forEach((item) => {
                        if (item.inDetails === 1) {
                            titlesAndValues.push({
                                attrName: item.attrName,
                                titleName: item.title,
                                value: state.current_obj[item.attrName]
                            });
                        }
                    });
                    return titlesAndValues
                }
            },

            filters(state) {
                let filters = [];
                state.scheme.forEach((attr) => {
                    if (attr.filterType === 'input') {
                        filters.push({
                            attrName: attr.attrName,
                            title: attr.title,
                            type: 'input',

                        });
                    }
                    if (attr.filterType === 'dropdown') {
                        let listValues = [];
                        state.objs.forEach(obj => {
                                if ((obj[attr.attrName] != null) && (obj[attr.attrName] != '') && !listValues.includes(obj[attr.attrName])) {
                                    listValues.push(obj[attr.attrName]);
                                }
                            }
                        )
                        filters.push({
                            attrName: attr.attrName,
                            title: attr.title,
                            type: 'dropdown',
                            listValues: listValues.sort()
                        });
                    }
                });
                return filters;
            },


        },
    mutations: {
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
            state.scheme.forEach((item) => {
                if (item['attrName'] === name) {
                    item['inTable'] === 1
                }
            });
        },
        setTitleTableOff(state, name) {
            state.scheme.forEach((item) => {
                if (item['attrName'] === name) {
                    item['inTable'] === 0
                }
            });

        },
        setCurrentObjFromRow(state, row) {
            //найти объект в общем списке, который соответствует присланной строке
            state.current_obj = [...state.objs].filter(item => {
                if ((item.name === row.name) && (item.id === row.id)) {
                    return item
                }
            })[0];

        },
        setFiltersValues(state, newFiltersValues) {
            state.filtersValues = newFiltersValues;
        },
    },
    actions: {
        loadSettlements({commit}) {
            try {
                const response = SettlementsJsonFile;
                commit('setCRS', response.crs);
                commit('setSettlements', response.features);
            } catch (e) {
                alert('Ошибка загрузки файла');
            }
        },


    },
    namespaced: true,
}
