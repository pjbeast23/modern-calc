import React from "react";
import XSpreadsheet from "x-data-spreadsheet";
import "x-data-spreadsheet/dist/xspreadsheet.css";
import ExportXLSX from "../ExportXLSX";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

type Props = {
    height?: string;
    width?: string;
    data: any;
    options: any;
}

const Spreadsheet: React.FC<Props> = ({
    height,
    width,
    data,
    options
}) => {
    const sheetEl = React.useRef<HTMLDivElement>(null);
    const sheetRef = React.useRef<XSpreadsheet | null>(null);
    const [state, setState] = React.useState(data || {});

    React.useEffect(() => {
        const element = sheetEl.current;
        const sheet = new XSpreadsheet("#x-spreadsheet-demo", {
            view: {
                height: () =>
                    (element && element.clientHeight) ||
                    document.documentElement.clientHeight,
                width: () =>
                    (element && element.clientWidth) ||
                    document.documentElement.clientWidth
            },
            ...options
        })
            .loadData(state)
            .change((data) => {
                setState(data);
                socket.emit('update-cell', data);
            });

        sheet.on('cell-edited', (text, ri, ci) => {
            socket.emit('update-cell',{text, ri, ci});
        });

        socket.on('update-cell', ({text, ri, ci}) => {
          sheet.cellText(ri, ci,text).cellText(ri, ci, text).reRender();//do not change
        });

        sheetRef.current = sheet;

        return () => {
            if (element) {
                element.innerHTML = "";
            }
        };
    }, [options]);

    return (
        <>
            <button onClick={() => ExportXLSX(sheetRef.current)}>export</button>
            <div
                style={{ height: height || "100%", width: width || "100%" }}
                id="x-spreadsheet-demo"
                ref={sheetEl}
            >
            </div>
            <div>
                <pre>{JSON.stringify(state, null, 2)}</pre>
            </div>
        </>
    );
}

export default Spreadsheet;
