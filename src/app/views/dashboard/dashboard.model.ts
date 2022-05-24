export interface ChartOptions {
    chart: Types;
    title: Types;
    subtitle: Types;
    credits: Types;
    xAxis: Title;
    yAxis: Title;
    legend: Types;
    plotOptions: any;
    series: Series[];
}

export interface Series {
    name: string[];
    color: string;
    data: any;
}

export interface Title {
    title: Types;
}

export interface Types {
    type: string;
    text: string;
    enabled: boolean;
}
export interface Payload {
    series: any;
    header: string[];
    x: string;
}
export interface ChartData {
    nameY: string;
    nameX: string;
    desc: string;
    chartType: string;
    payload: Payload;
}
