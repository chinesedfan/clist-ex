const data = [
    { color: 'red', label: 'Div 1' },
    { color: 'orange', label: 'Div 2' },
    { color: '#40826D', label: 'Div 3' },
    { color: 'grey', label: 'Div 4' },
  ];
  
  const LegendComponent = () => (
    <div className="legend-container">
      <table className="legend-table">
        <tbody>
          <tr>
            {data.map((item, index) => (
              <td key={index} className="legend-cell">
                <div className="legend-item">
                  <span className="legend-color-box" style={{ backgroundColor: item.color }}></span>
                  <span>{item.label}</span>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
  
  export default LegendComponent;
  