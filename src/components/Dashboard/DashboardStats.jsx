import PropTypes from 'prop-types'
import { IoBookOutline, IoBan } from 'react-icons/io5'
import { PiStudent, PiCheck } from 'react-icons/pi'

export default function DashboardStatsGrid() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            <BoxWrapper>
                <div className="mb-4 flex rounded-full h-11 w-11 flex items-center justify-center bg-sky-500">
                    <PiStudent className="text-2xl text-white" />
                </div>
                <div className="mt-4 flex items-end justify-between text-neutral-700">
                    <div>
                        <h4 className="text-title-md font-bold">$3.456K</h4>
                        <span className="text-sm font-medium">Total Student Today</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-3 undefined ">0.43%</span>
                </div>
            </BoxWrapper>
            <BoxWrapper>
                <div className="mb-4 flex rounded-full h-11 w-11 flex items-center justify-center bg-yellow-300">
                    <IoBookOutline className="text-2xl text-white" />
                </div>
                <div className="mt-4 flex items-end justify-between text-neutral-700">
                    <div>
                        <h4 className="text-title-md font-bold">$3.456K</h4>
                        <span className="text-sm font-medium">Total Class Today</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-3 undefined ">0.43%</span>
                </div>
            </BoxWrapper>
            <BoxWrapper>
                <div className="mb-4 flex rounded-full h-11 w-11 flex items-center justify-center bg-green-500">
                    <PiCheck className="text-2xl text-white" />
                </div>
                <div className="mt-4 flex items-end justify-between text-neutral-700">
                    <div>
                        <h4 className="text-title-md font-bold">$3.456K</h4>
                        <span className="text-sm font-medium">Attended Today</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-3 undefined ">0.43%</span>
                </div>
            </BoxWrapper>
            <BoxWrapper>
                <div className="mb-4 flex rounded-full h-11 w-11 flex items-center justify-center bg-red-500">
                    <IoBan className="text-2xl text-white" />
                </div>
                <div className="mt-4 flex items-end justify-between text-neutral-700">
                    <div>
                        <h4 className="text-title-md font-bold">$3.456K</h4>
                        <span className="text-sm font-medium">Absent</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-3 undefined ">0.43%</span>
                </div>
            </BoxWrapper>
        </div>
    )
}

function BoxWrapper({ children }) {
    return (
        <div className="p-4 flex-1 rounded-sm border border-stroke bg-white py-7.5 px-6 shadow-default">{children}</div>
    )
}

BoxWrapper.propTypes = {
    children: PropTypes.node.isRequired
}
