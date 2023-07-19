import { Button } from '@enact/sandstone/Button';
import { Alert } from '@enact/sandstone/Alert';
import Switch from '@enact/sandstone/Switch';
import Dropdown from '@enact/sandstone/Dropdown';
import Popup from '@enact/sandstone/Popup';

import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

import './SettingModal.css'
import { DATABASE_IP } from '../database';

function Modal({ wine, isSmart, onClose, nowTargetValue, nowMode, cellar_id }) {
    const [temp, setTemp] = useState(nowTargetValue)
    const [mode, setMode] = useState(nowMode)
    const [isSmartMode, setSmartMode] = useState(isSmart)
    const [canChangeMode, setCanChangeMode] = useState()

    console.log(wine)

    useEffect(() => {
        const initializeCanChangeMode = () => {
            const rows = new Set(wine.map((w) => w.row));
            const initialCanChangeMode = Array.from(rows).map((row) => {
                const typesInRow = new Set(wine.filter((w) => w.row === row).map((w) => w.wine_id.type));
                return typesInRow.size === 1;
            });
            setCanChangeMode(initialCanChangeMode);
        };

        initializeCanChangeMode();
    }, [wine]);

    const applyChanges = () => {
        //만약 smart off -> on이 켜질 때 오류창 생성
        //Wine Cellar POST
        axios.post(`${DATABASE_IP}:3000/winecellar/setting`, {
            cellarid: cellar_id,
            floor1_type: mode[0],
            floor1_temperature_target: temp[0],
            floor1_is_smart_mode: isSmartMode[0],
            floor2_type: mode[1],
            floor2_temperature_target: temp[1],
            floor2_is_smart_mode: isSmartMode[1],
            floor3_type: mode[2],
            floor3_temperature_target: temp[2],
            floor3_is_smart_mode: isSmartMode[2],
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
        onClose(); // 모달 닫기
    };

    return (
        <div className="modal-container">
            <div>
                <h2>Setting</h2>
                <div className="modal-content-container">
                    <RenderContentsBox canChangeMode={canChangeMode} smart={isSmartMode} setSmart={setSmartMode} setTemperature={setTemp} setMode={setMode} temperature={temp} mode={mode} idx={0} />
                    <RenderContentsBox canChangeMode={canChangeMode} smart={isSmartMode} setSmart={setSmartMode} setTemperature={setTemp} setMode={setMode} temperature={temp} mode={mode} idx={1} />
                    <RenderContentsBox canChangeMode={canChangeMode} smart={isSmartMode} setSmart={setSmartMode} setTemperature={setTemp} setMode={setMode} temperature={temp} mode={mode} idx={2} />
                </div>
                <div className="modal-apply-btn">
                    <Button onClick={applyChanges}>Apply</Button>
                </div>
            </div>
        </div>
    );
}

function RenderContentsBox({ canChangeMode, smart, setSmart, setTemperature, setMode, temperature, mode, idx }) {
    const [alert, setAlert] = useState(false);

    const handleToggle = (e) => {
        //여기서 체크
        console.log(canChangeMode)
        if (canChangeMode[idx]) {
            setSmart(prevSmart => {
                const newSmart = [...prevSmart];
                newSmart[idx] = !newSmart[idx];
                return newSmart;
            });
        }
        else {
            //경고창 띄우기
            setAlert(true);
        }
    };

    const closeAlert = () => {
        setAlert(false);
    }

    return (
        <div className="modal-contents-box">
            <div className="modal-floor-box">
                <div className="modal-mode-onoff-btn">
                    <span>
                        <Switch onToggle={handleToggle} selected={smart[idx]} />
                        {alert && (
                            <Alert open={alert} type='overlay'>
                                Can't Change (Floor is Mixed)
                                <buttons>
                                    <Button
                                        onClick={closeAlert}
                                        backgroundOpacity="transparent"
                                        size="small"
                                        icon="closex"
                                    />
                                </buttons>
                            </Alert>
                        )}
                    </span>
                    <span>{smart[idx] ? <span>Smart Mode On</span> : <span>Smart Mode Off</span>}</span>
                </div>
                <div className="modal-mode-change-btn">
                    <ChangeModeButton isOn={smart[idx]} mode={mode} setMode={setMode} idx={idx} />
                </div>
                <div className="modal-temp-box">
                    <ChangeTemp isOn={smart[idx]} temperature={temperature} setTemperature={setTemperature} idx={idx}/>
                </div>
            </div>
        </div>
    );
}

//해당 함수에서는 Dropbox가 0번째 인덱스부터 선택되기 때문에 보정하는 과정이 들어갑니다.
function ChangeModeButton({ isOn, mode, setMode, idx }) {
    const [selected, setSelected] = useState(mode[idx] -1 );

    const handleChange = (e) => {
        setSelected(e.selected);
        setMode(prevMode => {
            const newMode = [...prevMode];
            newMode[idx] = e.selected + 1;
            return newMode;
        });
    };

    return (
        <div>
            <Dropdown inline title="Mode" disabled={!isOn} defaultSelected={selected} selected={selected} onSelect={handleChange}>
                {['Red', 'White', 'Sparkling']}
            </Dropdown>
        </div>
    );
}



function ChangeTemp({ isOn, temperature, setTemperature, idx }) {
    const increaseTemp = () => {
        setTemperature(prevTargetTemp => {
            const newTargetTemp = [...prevTargetTemp];
            newTargetTemp[idx] = newTargetTemp[idx] + 1;
            return newTargetTemp;
        });
    };

    const decreaseTemp = () => {
        setTemperature(prevTargetTemp => {
            const newTargetTemp = [...prevTargetTemp];
            newTargetTemp[idx] = newTargetTemp[idx] - 1;
            return newTargetTemp;
        });
    };

    return (
        <div>
            <div className="modal-temp-content">Target: {temperature[idx]}°C</div>
            <div className="modal-temp-content">
                <Button
                    onClick={increaseTemp}
                    backgroundOpacity="transparent"
                    size="small"
                    icon="plus"
                    disabled={isOn}
                />
                <Button
                    onClick={decreaseTemp}
                    backgroundOpacity="transparent"
                    size="small"
                    icon="minus"
                    disabled={isOn}
                />
            </div>
        </div>
    );
}


const SettingModal = ({ wine, isSmart, isOpen, onClose, nowTargetValue, nowMode, cellar_id}) => {
    return (
        <Popup open={isOpen} onClose={onClose} position="center">
            <Modal wine={wine} isSmart={isSmart} nowTargetValue={nowTargetValue} nowMode={nowMode} onClose={onClose} cellar_id={cellar_id}/>
        </Popup>
    );
};

export default SettingModal;