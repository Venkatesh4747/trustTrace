export const CHART_DATA = {
    'Material Exposure - BAR': {
        xCategories: ['Organic Cotton', 'Cotton', 'Polyester', 'Leather', 'Merino Wool', 'Nylon'],
        series: [
            {
                name: 'Materials',
                data: [105, 47, 10, 23, 70, 30]
            }
        ]
    },
    'Country of Origin - BAR': {
        xCategories: ['Portugal', 'Italy', 'China', 'Turkey', 'India', 'Vietnam'],
        series: [
            {
                name: 'Countries',
                data: [89, 78, 50, 23, 30, 70]
            }
        ]
    },
    'Sustainability Labels - BAR': {
        xCategories: ['Biodegradeable', 'Recycled', 'Organic', 'Chemical Free', 'Cruelty Free', 'Circular'],
        series: [
            {
                name: 'Sustainability Labels',
                data: [30, 10, 50, 23, 10, 40]
            }
        ]
    },
    'Certifications - BAR': {
        xCategories: ['GOTS', 'GRS', 'Oeko-Tex', 'Merino', 'BCI', 'BlueSign'],
        series: [
            {
                name: 'Certifications',
                data: [141, 60, 30, 73, 10, 43]
            }
        ]
    },
    'Styles over the years - LINE': {
        xCategories: ['2015', '2016', '2017', '2018'],
        series: [
            {
                name: 'Styles',
                data: [300, 345, 325, 360]
            }
        ]
    },
    'Trend Line - Material Exposure - LINE': {
        xCategories: ['2015', '2016', '2017', '2018'],
        series: [
            {
                name: 'Organic Cotton',
                data: [150, 175, 230, 250]
            },
            {
                name: 'Cotton',
                data: [47, 50, 40, 62]
            },
            {
                name: 'Polyester',
                data: [117, 157, 160, 97]
            },
            {
                name: 'Leather',
                data: [50, 47, 35, 40]
            },
            {
                name: 'Merino Wool',
                data: [67, 45, 57, 70]
            }
        ]
    },
    'Trend Line - Country of Origin - LINE': {
        xCategories: ['2015', '2016', '2017', '2018'],
        series: [
            {
                name: 'Portugal',
                data: [170, 175, 160, 150]
            },
            {
                name: 'Italy',
                data: [37, 30, 46, 72]
            },
            {
                name: 'China',
                data: [117, 157, 150, 137]
            },
            {
                name: 'India',
                data: [70, 67, 55, 74]
            },
            {
                name: 'Vietnam',
                data: [27, 25, 17, 19]
            }
        ]
    },
    'Trend Line - Sustainability Labels - LINE': {
        xCategories: ['2015', '2016', '2017', '2018'],
        series: [
            {
                name: 'Biodegradable',
                data: [67, 45, 57, 70]
            },
            {
                name: 'Recyclable',
                data: [137, 130, 146, 152]
            },
            {
                name: 'Chemical Free',
                data: [17, 37, 50, 47]
            },
            {
                name: 'Organic',
                data: [155, 167, 170, 174]
            }
        ]
    },
    'Trend Line - Certifications - LINE': {
        xCategories: ['2015', '2016', '2017', '2018'],
        series: [
            {
                name: 'GOTS',
                data: [267, 245, 257, 270]
            },
            {
                name: 'GRS',
                data: [57, 50, 46, 52]
            },
            {
                name: 'Oeko-Tex',
                data: [127, 127, 155, 167]
            },
            {
                name: 'BlueSign',
                data: [15, 16, 10, 17]
            },
            {
                name: 'BCI',
                data: [25, 27, 17, 17]
            }
        ]
    },
    'Suppliers - BAR': {
        xCategories: ['Supplier 1', 'Supplier 2', 'Supplier 3', 'Supplier 4', 'Supplier 5', 'Supplier 6'],
        series: [{ name: 'Styles', data: [15, 12, 12, 9, 6, 5] }]
    },
    'Supplier Retention - BAR': {
        xCategories: ['Till 2014 ', '2015', '2016', '2017', '2018', '2019'],
        series: [{ name: 'Suppliers', data: [40, 47, 45, 50, 50, 50] }]
    },
    'Supplier vs Value Process - BAR': {
        xCategories: ['Cutting ', 'Stitching', 'Knitting', 'Weaving', 'Spinning', 'Dyeing'],
        series: [{ name: 'Suppliers', data: [40, 47, 45, 25, 35, 15] }]
    },
    'Facility vs Value Process - BAR': {
        xCategories: ['Cutting ', 'Stitching', 'Knitting', 'Weaving', 'Spinning', 'Dyeing'],
        series: [{ name: 'Suppliers', data: [40, 47, 45, 25, 35, 15] }]
    },
    'Supplier vs Conformance Rating - BAR': {
        xCategories: ['1', '2', '3', '4', '5'],
        series: [{ name: 'Suppliers', data: [9, 12, 20, 50, 35] }]
    },
    'Supplier vs Materials - BAR': {
        xCategories: ['Cotton', 'Polyester', 'Nylon', 'Wool', 'Leather'],
        series: [{ name: 'Suppliers', data: [50, 32, 20, 30, 15] }]
    },
    'Facility vs Materials - BAR': {
        xCategories: ['Cotton', 'Polyester', 'Nylon', 'Wool', 'Leather'],
        series: [{ name: 'Suppliers', data: [50, 32, 20, 30, 15] }]
    },
    'Years - BAR': {
        xCategories: ['2015', '2016', '2017', '2018'],
        series: [
            {
                name: 'Styles',
                data: [300, 345, 325, 360]
            }
        ]
    },
    'Facility vs Certificates - STACK': {
        xCategories: ['GOTS', 'GRS', 'Oeko-Tex', 'Merino', 'BlueSign'],
        series: [
            { name: 'Portugal', data: [15, 13, 14, 10, 5] },
            { name: 'Lithuania', data: [13, 15, 26, 6] },
            { name: 'India', data: [34, 15, 27, 0, 20] },
            { name: 'China', data: [4, 25, 10, 3, 29] }
        ]
    },
    'Supplier vs Associated Since - BAR': {
        xCategories: ['5 years & beyond', '4 years ago', '3 years ago', '2 years ago', 'last year', 'current year'],
        series: [{ name: 'Suppliers', data: [1, 3, 12, 18, 25, 36] }]
    }
};
