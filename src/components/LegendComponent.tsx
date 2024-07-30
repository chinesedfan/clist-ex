import React from 'react';

export const LegendComponent = React.memo(() => (
    <div className="div-heading-container">
        <table className="div-heading-table">
            <tbody>
                <tr>
                    {[1, 2, 3, 4].map((item, index) => (
                        <td key={index} className="div-cell">
                            <div className="div-item">
                                <span className={"div-color-box-" + item}></span>
                                <span>Div {item}</span>
                            </div>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    </div>
));
