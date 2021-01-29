<template>
    <div id="MeetingDetail">
        <div class="notice" v-if="!isAccess" v-text="message"></div>
        <!-- 会议信息 -->
        <template v-else>
            <div class="page-t" v-if="conference.conference">
                <!--            <img class="meeting-type-icon" :src="icons[0]" alt="">-->
                <!--            <span class="meeting-type" v-text="conference.conference.type[0]"></span>-->
                <div class="t-meeting-name" v-text="conference.conference.full_title"></div>
                <div class="page-t-m">
                    <div class="m-l">
                        <div class="meeting-info meeting-info-t">
                            <span class="info-label">时间：</span>
                            <span class="info-label info-content" v-text="conference.conference.date_start"></span>
                        </div>
                        <div class="meeting-info">
                            <span class="info-label">地点：</span>
                            <span class="info-label info-content" v-text="conference.conference.address"></span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 会议议程 -->
            <template v-if="!meetingFileShow">
                <div class="page-meeting-item" v-for="(item, pindex) in conference.catalog" :key="item.uuid">
                    <div class="flex-center-between item-meeting-t" @click="selectMeeting(pindex, item.type)">
                        <div class="item-l">
                            <div v-if="pindex%3 === 0" class="item-l-indexes" v-text="pindex+1"></div>
                            <div v-else-if="pindex%3 === 1" class="item-l-indexes item-l-indexes1" v-text="pindex+1"></div>
                            <div v-else-if="pindex%3 === 2" class="item-l-indexes item-l-indexes2" v-text="pindex+1"></div>
                            <div class="process-name" v-text="item.first?item.first:item.name"></div>
                        </div>
                        <img v-if="!item.isOpen" class="item-r-icon1" :src="icons[4]" alt="">
                        <img v-else class="item-r-icon2" :src="icons[5]" alt="">
                    </div>
                    <div class="item-meeting-m" v-if="item.isOpen">
                        <template>
                            <template v-if="!item.children[0].md5">
                                <div v-for="(process, cindex) in item.children" :key="process.uuid">
                                    <div class="flex-center-between meeting-m-b" @click="selectProcessMeeting(pindex,cindex)">
                                        <div class="m-b-l">
                                            <div class="item-l-indexes" v-text="cindex+1"></div>
                                            <div class="process-name process-name-small">{{ process.name }}</div>
                                        </div>
                                        <img v-if="!process.isOpen" class="item-r-icon1" :src="icons[4]" alt="">
                                        <img v-else class="item-r-icon2" :src="icons[5]" alt="">
                                    </div>
                                    <template>
                                        <div v-if="process.isOpen" class="flex-center-between meeting-file" v-for="file in process.children"
                                             :key="file.uuid" @click="openFile(file.uuid)">
                                            <div class="file-l">
                                                <img class="file-l-icon" :src="icons[8]" alt="">
                                                <span class="file-name" v-text="file.name"></span>
                                            </div>
                                            <img class="r-arrow-icon" :src="icons[3]" alt="">
                                        </div>
                                    </template>
                                </div>
                            </template>
                            <template v-else>
                                <div class="meeting-files">
                                    <div class="content-item" @click="openFile(file.uuid)" v-for="file in item.children" :key="file.cdc_uuid">
                                        <div class="item-l">
                                            <img class="item-l-l" :src="icons[8]" alt="">
                                            <div class="item-l-r">
                                                <div class="item-file-name">{{ file.name }}</div>
                                                <!-- <div class="item-file-date">{{ file.datetime_modified }}</div> -->
                                            </div>
                                        </div>
                                        <img class="item-r" :src="icons[3]" alt="">
                                    </div>
                                </div>
                            </template>
                        </template>
                    </div>
                </div>
            </template>
            <div v-else class="page-m">
                <div class="label">文件列表（{{files.length}}）</div>
                <div class="page-m-file">
                    <div class="content-item" @click="openFile(file.uuid)" v-for="file in files" :key="file.cdc_uuid">
                        <div class="item-l">
                            <img class="item-l-l" :src="images[4]" alt="">
                            <div class="item-l-r">
                                <div class="item-file-name">{{ file.name }}</div>
                                <div class="item-file-date">{{ file.datetime_modified }}</div>
                            </div>
                        </div>
                        <img class="item-r" :src="images[5]" alt="">
                    </div>
                </div>
            </div>
            <div class="menus">
                <div class="menu-box" @click="meetingFileToggle">会议<br/>{{meetingFileShow ? '详情' : '文件'}}</div>
            </div>
        </template>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    name: "MeetingDetail",
    data() {
        return {
            icons: [
                './images/1.png',
                './images/17.png',
                './images/18.png',
                './images/9.png',
                './images/10.png',
                './images/7.png',
                './images/31.png',
                './images/32.png',
                './images/6.png',
                './images/27.png', // 9
                './images/22.png',
                './images/23.png',
                './images/24.png',
                './images/33.png', // 13
            ],
            isHost: 0,
            conference: {},
            host: 'http://192.168.110.216:8010',
            // host: '',
            uuid: '40aa458a-17f9-11eb-9214-0c9d92cc5ea4', // 会议uuid
            // uuid: '', // 会议uuid
            files: [],
            images: [
                './images/41.png',
                './images/42.png',
                './images/43.png',
                './images/44.png',
                './images/45.png',
                './images/46.png'
            ],
            meetingFileShow: false, // 会议文件是否显示
            isAccess: true, // 是否允许访问会议信息
            message: '', // 拒绝访问原因
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            // let href = window.location.href.split('?');
            // this.host = window.location.protocol + '//' + window.location.host;
            // this.uuid = href[1].split('#')[0].split('=')[1];
            this.getMeetingDetail();
            this.getMeetingFiles();
        },
        // 获取会议详情
        getMeetingDetail() {
            axios.get(`${this.host}/v1/conference/scanningConference/get/${this.uuid}/`)
                .then((res) => {
                    if (res.data.state === 1) {
                        this.conference = res.data.results;
                        this.conference.catalog.forEach((meeting) => {
                            this.$set(meeting, 'isOpen', false);
                            if(meeting.children && meeting.children.length !== 0) {
                                meeting.children.forEach((item) => {
                                    this.$set(item, 'isOpen', false);
                                })
                            } else  {
                                meeting.children = [];
                            }
                        });
                    } else {
                        this.isAccess = false;
                        this.message = res.data.results;
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        },
        // 获取会议文件列表
        getMeetingFiles() {
            axios.get(`${this.host}/v1/conference/scanningConferenceFile/get/${this.uuid}/`)
                .then((res) => {
                    this.files = res.data.results;
                })
                .catch(err => {
                    console.error(err);
                });
        },
        // 选择会议
        selectMeeting(index) {
            this.conference.catalog[index].isOpen = !this.conference.catalog[index].isOpen;
        },
        // 选择议程
        selectProcessMeeting(pindex, cindex) {
            this.conference.catalog[pindex].children[cindex].isOpen = !this.conference.catalog[pindex].children[cindex].isOpen;
        },
        // 打开会议文件
        openFile(uuid) {
            this.$router.push({
                path: '/pdf-view',
                query: {
                    src: `${this.host}/v1/conference/downloadconferencedocument/${uuid}/`
                }
            });
        },
        // 会议文件列表切换
        meetingFileToggle() {
            this.meetingFileShow = !this.meetingFileShow;
        }
    }
}
</script>

<style scoped lang="less">
#MeetingDetail {
    background: #EEEEEE;
    .notice {
        width: 100%;
        text-align: center;
        position: absolute;
        top: 50%;
        transform: rotateY(-50%);
    }
    .page-t {
        width: 100%;
        background: #FFFFFF;
        margin-top: 10px;
        padding-top: 15px;
        position: relative;

        .meeting-type-icon {
            width: 25px;
            height: 23px;
            transform: rotate(90deg);
            position: absolute;
            top: -3px;
            left: 15px;
        }

        .meeting-type {
            position: absolute;
            top: 1px;
            left: 20px;
            font-size: 12px;
            color: #ffffff;
        }

        .t-meeting-name {
            width: 241px;
            font-size: 18px;
            font-weight: bold;
            color: rgba(51, 51, 51, 1);
            line-height: 25px;
            margin: 0 auto 9px;
            text-align: center;
        }

        .page-t-m {
            width: calc(100% - 30px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px 10px;

            .m-l {
                .meeting-info {
                    .info-label {
                        font-size: 13px;
                        font-weight: bolder;
                        color: #333333;
                    }

                    .info-content {
                        color: #777777;
                    }
                }

                .meeting-info-t {
                    margin-bottom: 10px;
                }
            }

            .m-r {
                width:80px;
                height:30px;
                text-align: center;
                border-radius:2px;
                border:1px solid rgba(31,113,255,1);
                background: #1F71FF;

                .m-r-number {
                    font-size: 13px;
                    line-height: 30px;
                    color: #FFFFFF;
                    margin-top: 4px;
                    font-weight: bold;
                }
            }

            .m-r1 {
                background:rgba(31,113,255,1);
            }

            .m-r2 {
                background:rgba(255,255,255,1);

                .m-r-number {
                    color: #1F71FF;
                }
            }
        }
    }

    .page-meeting-item {
        margin-top: 10px;
        width: calc(100% - 15px);
        padding-left: 15px;
        padding-bottom: 10px;
        background: #FFFFFF;

        // ----公用样式start-------

        .item-l-indexes {
            width: 26px;
            height: 26px;
            font-size: 14px;
            font-weight: bold;
            color: rgba(255, 255, 255, 1);
            line-height: 26px;
            text-align: center;
            background: rgba(31, 113, 255, 1);
            border-radius: 2px;
            margin-right: 12px;
        }

        .item-l-indexes1 {
            background: #00AB64;
        }

        .item-l-indexes2 {
            background: #FFAC00;
        }

        .process-name {
            max-width: 285px;
            font-size: 14px;
            font-weight: bold;
            color: rgba(51, 51, 51, 1);
            line-height: 20px;
        }

        .item-r-icon1 {
            width: 6px;
            height: 9px;
        }

        .item-r-icon2 {
            width: 8px;
            height: 5px;
        }

        .r-arrow-icon {
            width: 6px;
            height: 9px;
        }

        .flex-center-between {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 11px 15px 11px 0;
            border-bottom: 1px solid #EEEEEE;
        }

        // ----公用样式end-------

        .item-meeting-t {
            width: calc(100% - 15px);

            .item-l {
                display: flex;
                align-items: center;
            }
        }

        .item-meeting-m {
            margin-left: 38px;

            .label-l {
                font-size: 12px;
                font-weight: bolder;
                color: #333333;
            }

            .label-r {
                color: #777777;
            }

            .meeting-m-t {
                width: cacl(100% - 53px);
                padding: 11px 0;
                border-bottom: 1px solid #EEEEEE;
            }

            .meeting-m-m {
                width: cacl(100% - 68px);
            }

            .meeting-m-b {
                width: cacl(100% - 68px);

                .m-b-l {
                    display: flex;
                    align-items: center;

                    .process-name-small {
                        font-size: 13px;
                        width: 249px;
                    }
                }
            }

            .meeting-file {
                width: calc(100% - 27px);
                margin-left: 12px;

                .file-l {
                    display: flex;
                    align-items: center;

                    .file-l-icon {
                        width: 24px;
                        height: 25px;
                        margin-right: 9px;
                    }

                    .file-name {
                        max-width: 220px;
                        font-size: 13px;
                        color: rgba(51, 51, 51, 1);
                    }
                }
            }

            .meeting-files {
                background: #FFFFFF;
                width: 100%;
                padding: 0;

                .content-item {
                    width: calc(100% - 15px);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 15px 0 15px 0;
                    border-bottom: 1px solid #EEEEEE;

                    .item-l {
                        display: flex;
                        align-items: center;

                        .item-l-l {
                            width: 29px;
                            height: 30px;
                            margin-right: 10px;
                        }

                        .item-l-r {
                            display: flex;
                            flex-direction: column;

                            .item-file-name {
                                max-width: 290px;
                                font-size: 13px;
                                line-height: 16px;
                                font-weight: bold;
                                color: rgba(51, 51, 51, 1);
                                margin-bottom: 6px;
                            }

                            .item-file-date {
                                font-size: 12px;
                                font-weight: 400;
                                color: rgba(153, 153, 153, 1);
                            }
                        }
                    }
                    .item-r {
                        width: 6px;
                        height: 9px;
                    }
                }
            }
        }
    }
    .page-m {
        .label {
            width: calc(100% - 15px);
            padding: 15px 0 15px 15px;
            font-size: 18px;
            font-weight: bold;
            color: rgba(51, 51, 51, 1);
        }
        .page-m-file {
            background: #FFFFFF;
            width: calc(100% - 15px);
            padding-left: 15px;
            .content-item {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 15px 0;
                border-bottom: 1px solid #EEEEEE;
                .item-l {
                    display: flex;
                    align-items: center;
                    .item-l-l {
                        width: 29px;
                        height: 30px;
                        margin-right: 10px;
                    }
                    .item-l-r {
                        display: flex;
                        flex-direction: column;
                        .item-file-name {
                            max-width: 290px;
                            font-size: 13px;
                            line-height: 16px;
                            font-weight: bold;
                            color: rgba(51, 51, 51, 1);
                            margin-bottom: 6px;
                        }
                        .item-file-date {
                            font-size: 12px;
                            font-weight: 400;
                            color: rgba(153, 153, 153, 1);
                        }
                    }
                }
                .item-r {
                    width: 6px;
                    height: 10px;
                    margin-right: 15px;
                }
            }
        }
    }
    .menus {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: fixed;
        right: 15px;
        bottom: 30px;
        .menu-box {
            width: 55px;
            height: 50px;
            border-radius: 50%;
            background: #00ab64;
            color: #FFFFFF;
            text-align: center;
            padding-top: 5px;
        }
        .meeting-service {
            width: 55px;
            height: 55px;
        }
        .menu {
            margin-top: 22px;
        }
    }
}
</style>
