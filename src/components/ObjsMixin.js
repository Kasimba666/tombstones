export default {
    data() {
        return {}
    },
    computed: {
        filters() {
            if (!!this.inputGeojson) {
                let newFilters = [];
                this.schemeObjs.forEach((attr) => {
                    if (attr.filterType === 'input') {
                        newFilters.push({
                            attrName: attr.attrName,
                            title: attr.title,
                            type: 'input',
                        });
                    }
                    if (attr.filterType === 'dropdown') {
                        let listValues = [];
                        this.inputGeojson.features.forEach(feature => {
                            if (feature.properties[attr.attrName] != null && feature.properties[attr.attrName] != '' && !listValues.map((v)=>{return v.value}).includes(feature.properties[attr.attrName])) {
                                let newParentValue = null;
                                if (attr.parentValueFrom != null) {
                                    if (feature.properties[attr.parentValueFrom] != null && feature.properties[attr.parentValueFrom] != '') {
                                        newParentValue = feature.properties[attr.parentValueFrom];
                                    }
                                }

                                listValues.push({value:feature.properties[attr.attrName], parentValue: newParentValue});
                            }
                        });
                        newFilters.push({
                            attrName: attr.attrName,
                            attrParent: attr.parentValueFrom,
                            title: attr.title,
                            type: 'dropdown',
                            listValues: listValues.sort()
                        });
                    }//dropdown
                }); //end of forEach.scheme
                return newFilters;
            }
        },
        filtered() {
            if (!!this.inputGeojson) {
                let newFeatures = [];
                this.inputGeojson.features.forEach((item) => {
                    //проверить item на соответствие значениям фильтров
                    let filterPass = true;
                    this.filtersValues.forEach((fV) => {
                        if (!(
                            ((fV.type === 'dropdown') && ((fV.value === item.properties[fV.attrName]) || (fV.value == null))) ||
                            ((fV.type === 'input') && (fV.value == null) || (fV.value === '')
                                || ((item.properties[fV.attrName] != null ? item.properties[fV.attrName] : '').toString().toLowerCase().includes((fV.value != null ? fV.value : '').toString().toLowerCase(), 0)))
                        )) {
                            filterPass = false;
                        }
                    });
                    //сформировать отфильтрованный geojson
                    if (filterPass) {
                        newFeatures.push({
                            type: item.type,
                            properties: item.properties,
                            geometry: item.geometry,
                        });
                    }
                })
                return {
                    type: this.inputGeojson.type,
                    name: this.inputGeojson.name,
                    crs: this.inputGeojson.crs,
                    features: newFeatures,
                }
            }
        },
    },
    methods: {


    },
    mounted() {

    },
}
