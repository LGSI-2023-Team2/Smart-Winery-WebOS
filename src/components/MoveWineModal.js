import { Button } from '@enact/sandstone/Button';
import Popup from '@enact/sandstone/Popup';
import Alert from '@enact/sandstone/Alert';

import * as React from 'react';
import { useEffect, useState } from 'react';

import './MoveWineModal.css'
import axios from 'axios';
import { Scroller } from '@enact/sandstone/Scroller';
import { DATABASE_IP } from '../database';

const MatrixRow = ({ row, wineArray, selectedSpace, handleSpaceClick }) => (
    <div className="matrix-row" key={row}>
        {Array.from({ length: 5 }).map((_, col) => {
            const isActive = wineArray.some((wine) => wine.row === row + 1 && wine.col === col + 1);
            const isSelected = selectedSpace && selectedSpace.row === row && selectedSpace.col === col;
            return (
                <button
                    className="matrix-button"
                    key={`${row}-${col}`}
                    onClick={() => handleSpaceClick({ row, col })}
                    disabled={isActive}
                >
                    {isActive ? "Occupied" : isSelected ? "Selected" : "Available"}
                </button>
            );
        })}
    </div>
);

function Modal({ onClose, wineArray, cellar_id, nowMode, isSmart  }) {
    const [selectedWine, setSelectedWine] = useState(null);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [alert, setAlert] = useState(false);
    const [condition, setCondition] = useState(false);
    const modeMappings = ['None', 'Red', 'White', 'Sparkling'];
    let flag = true;

    const handleWineClick = (wine) => {
        setSelectedWine(wine);
        setSelectedSpace(null);
    };

    const handleSpaceClick = (space) => {
        setSelectedSpace(space);
    };

    const closeAlert = () => {
        setAlert(false);
    }

    const getModeText = (modeType) => {
        const modeText = modeMappings[modeType] || 'Unknown';
        return modeText;
    };

    const applyChange = () => {
        if (selectedWine === null || selectedSpace===null) {
            setCondition(false);
            setAlert(true);
        }
        else {
            if (isSmart[selectedSpace.row - 1] === true) {
                if (selectedWine.wine_id.type != getModeText(nowMode[selectedSpace.row])) {
                    flag = false;
                    setCondition(true);
                    setAlert(true);
                }
            }
            
            if (flag) {
                //Wine Move POST
                axios.post(`${DATABASE_IP}:3000/winecellar/move`, {
                    cellarid: cellar_id,
                    wine_id: selectedWine.wine_id._id,
                    wine1_row: selectedWine.row,
                    wine1_col: selectedWine.col,
                    wine2_row: selectedSpace.row + 1,
                    wine2_col: selectedSpace.col + 1
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: 'Bearer token'
                    }
                })
                    .then(response => {
                        // 요청 성공 시 처리할 코드
                        console.log(response.data);
                    })
                    .catch(error => {
                        // 요청 실패 시 처리할 코드
                        console.error(error);
                    });
                onClose()
            }
        }
    }

    function getColorClass(type) {
        switch (type) {
            case "Red":
                return 'red';
            case "White":
                return 'yellow';
            case "Sparkling":
                return 'green';
            default:
                return '';
        }
    }


    return (
        <div className="modal-container">
            <h2>Choose Wine to Move</h2>
            <div className="modal-layout">
                <div className="mode-wine-select">
                    <Scroller style={{ maxHeight: '55vh' }}>
                        <ul>
                            {wineArray.map((item) => (
                                <li>
                                    <Button
                                        onClick={() => handleWineClick(item)}
                                        selected={selectedWine && selectedWine._id === item._id}
                                        className={`${selectedWine && selectedWine.id === item.id ? 'selected' : ''}`}
                                        color={getColorClass(item.wine_id.type)}
                                    >
                                        {item.wine_id.eng_name}
                                    </Button>

                                </li>
                            ))}
                        </ul>
                    </Scroller>
                </div>
                <div className="mode-cellar-status">
                    <div className="modal-mode-category">
                        <div>
                            <ModePanel isSmart={isSmart} type={nowMode} />
                        </div>
                        <div className="matrix-container">
                            {Array.from({ length: 3 }).map((_, row) => (
                                <MatrixRow
                                    key={row}
                                    row={row}
                                    wineArray={wineArray}
                                    selectedSpace={selectedSpace}
                                    handleSpaceClick={handleSpaceClick}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="modal-move-apply-btn">
                        <Button onClick={applyChange}>Apply</Button>
                        {alert && (
                            <Alert open={alert} type='overlay'>
                                {condition ? (
                                    <div className="alert-msg">
                                        You can't move in different type floor
                                        <div className="alert-msg-btn">
                                            <Button
                                                onClick={closeAlert}
                                                backgroundOpacity="transparent"
                                                size="small"
                                                icon="closex"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert-msg">
                                        Choose Wine or Space to Move
                                        <div className="alert-msg-btn">
                                            <Button
                                                onClick={closeAlert}
                                                backgroundOpacity="transparent"
                                                size="small"
                                                icon="closex"
                                            />
                                        </div>
                                    </div>
                                )}
                            </Alert>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const ModePanel = ({ isSmart, type }) => {
    const modeMappings = ['None', 'Red', 'White', 'Sparkling'];

    const getModeText = (modeType, index) => {
        const modeText = modeMappings[modeType] || 'Unknown';
        return isSmart[index] ? modeText : 'User Mode';
    };

    const getColorClass = (modeType) => {
        switch (modeType) {
            case 1:
                return 'red';
            case 2:
                return 'yellow';
            case 3:
                return 'green';
            default:
                return '';
        }
    };

    return (
        <div className="modal-mode-panel">
            {type.map((mode, index) => (
                <div
                    className={`modal-mode-panel-text ${getColorClass(mode)}`}
                    key={index}
                >
                    <div>{getModeText(mode, index)}</div>
                </div>
            ))}
        </div>
    );
};

const MoveWineModal = ({ isOpen, onClose, wine, cellar_id, nowMode, isSmart }) => {
    return (
        <Popup open={isOpen} onClose={onClose} position="center">
            <Modal onClose={onClose} wineArray={wine} cellar_id={cellar_id} nowMode={nowMode} isSmart={isSmart} />
        </Popup>
    );
};

export default MoveWineModal;