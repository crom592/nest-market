"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var users, createdUsers, groupPurchases;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Clear existing data
                return [4 /*yield*/, prisma.groupPurchase.deleteMany({})];
                case 1:
                    // Clear existing data
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany({})];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.createMany({
                            data: [
                                {
                                    name: '박민준',
                                    email: 'minjun.park@example.com',
                                    image: 'https://via.placeholder.com/150/0000FF/808080?text=박민준',
                                    password: 'password123',
                                    role: client_1.UserRole.CONSUMER,
                                    phone: '010-1234-5678',
                                    penaltyEndTime: null,
                                    lastParticipation: new Date(new Date().setDate(new Date().getDate() - 5)),
                                    points: 1000,
                                    bidCount: 5,
                                    rating: 4.5,
                                },
                                {
                                    name: '이서연',
                                    email: 'seoyeon.lee@example.com',
                                    image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=이서연',
                                    password: 'password123',
                                    role: client_1.UserRole.ADMIN,
                                    phone: '010-2345-6789',
                                    penaltyEndTime: new Date(new Date().setDate(new Date().getDate() + 10)),
                                    lastParticipation: new Date(new Date().setDate(new Date().getDate() - 10)),
                                    points: 2000,
                                    bidCount: 10,
                                    rating: 4.8,
                                },
                                {
                                    name: '김도윤',
                                    email: 'doyun.kim@example.com',
                                    image: 'https://via.placeholder.com/150/FFFF00/000000?text=김도윤',
                                    password: 'password123',
                                    role: client_1.UserRole.CONSUMER,
                                    phone: '010-3456-7890',
                                    penaltyEndTime: new Date(new Date().setDate(new Date().getDate() + 20)),
                                    lastParticipation: new Date(new Date().setDate(new Date().getDate() - 15)),
                                    points: 1500,
                                    bidCount: 8,
                                    rating: 4.2,
                                },
                            ],
                        })];
                case 3:
                    users = _a.sent();
                    return [4 /*yield*/, prisma.user.findMany()];
                case 4:
                    createdUsers = _a.sent();
                    return [4 /*yield*/, prisma.groupPurchase.createMany({
                            data: [
                                {
                                    title: '최신형 노트북 공동구매',
                                    description: '2024년형 맥북 프로 M3 칩셋 탑재 모델 공동구매입니다. 대량구매로 20% 할인된 가격에 구매 가능합니다.',
                                    creatorId: createdUsers[0].id,
                                    status: client_1.PurchaseStatus.RECRUITING,
                                    minParticipants: 10,
                                    maxParticipants: 100,
                                    currentParticipants: 25,
                                    auctionStartTime: new Date(),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 7)),
                                    imageUrl: 'https://via.placeholder.com/400x300/0000FF/FFFFFF?text=MacBook+Pro',
                                    voteStartTime: new Date(),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() + 2)),
                                    voteThreshold: 50,
                                    targetPrice: 2800000,
                                },
                                {
                                    title: '프리미엄 커피머신 공동구매',
                                    description: '브레빌 오라클 터치 커피머신 공동구매. 정가 대비 30% 할인된 가격으로 제공됩니다.',
                                    creatorId: createdUsers[1].id,
                                    status: client_1.PurchaseStatus.RECRUITING,
                                    minParticipants: 5,
                                    maxParticipants: 50,
                                    currentParticipants: 15,
                                    auctionStartTime: new Date(),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 5)),
                                    imageUrl: 'https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Coffee+Machine',
                                    voteStartTime: new Date(),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() + 1)),
                                    voteThreshold: 30,
                                    targetPrice: 1500000,
                                },
                                {
                                    title: '겨울 패딩 단체주문',
                                    description: '노스페이스 히말라야 패딩 공동구매. 10명 이상 구매시 추가 10% 할인',
                                    creatorId: createdUsers[2].id,
                                    status: client_1.PurchaseStatus.DRAFT,
                                    minParticipants: 15,
                                    maxParticipants: 150,
                                    currentParticipants: 8,
                                    auctionStartTime: new Date(),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 10)),
                                    imageUrl: 'https://via.placeholder.com/400x300/FFFF00/000000?text=Winter+Padding',
                                    voteStartTime: new Date(),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() + 3)),
                                    voteThreshold: 75,
                                    targetPrice: 450000,
                                },
                                {
                                    title: '유기농 식품 공동구매',
                                    description: '친환경 인증 유기농 과일, 채소 세트 공동구매. 직거래로 신선도 보장',
                                    creatorId: createdUsers[0].id,
                                    status: client_1.PurchaseStatus.COMPLETED,
                                    minParticipants: 20,
                                    maxParticipants: 200,
                                    currentParticipants: 200,
                                    auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 10)),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() - 3)),
                                    imageUrl: 'https://via.placeholder.com/400x300/00FF00/000000?text=Organic+Food',
                                    voteStartTime: new Date(new Date().setDate(new Date().getDate() - 15)),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() - 12)),
                                    voteThreshold: 100,
                                    targetPrice: 89000,
                                },
                                {
                                    title: '프로틴 보충제 공동구매',
                                    description: '마이프로틴 임팩트 웨이 프로틴 5kg 공동구매. 대량구매 특별할인',
                                    creatorId: createdUsers[1].id,
                                    status: client_1.PurchaseStatus.RECRUITING,
                                    minParticipants: 8,
                                    maxParticipants: 80,
                                    currentParticipants: 40,
                                    auctionStartTime: new Date(),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 6)),
                                    imageUrl: 'https://via.placeholder.com/400x300/FF00FF/FFFFFF?text=Protein',
                                    voteStartTime: new Date(),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() + 1)),
                                    voteThreshold: 60,
                                    targetPrice: 120000,
                                },
                                {
                                    title: '친환경 세제 대량구매',
                                    description: '친환경 인증 세탁세제, 주방세제 세트 공동구매. 1년치 구매시 추가할인',
                                    creatorId: createdUsers[2].id,
                                    status: client_1.PurchaseStatus.RECRUITING,
                                    minParticipants: 12,
                                    maxParticipants: 120,
                                    currentParticipants: 70,
                                    auctionStartTime: new Date(),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 8)),
                                    imageUrl: 'https://via.placeholder.com/400x300/00FFFF/000000?text=Eco+Detergent',
                                    voteStartTime: new Date(),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() + 2)),
                                    voteThreshold: 90,
                                    targetPrice: 75000,
                                },
                                {
                                    title: '프리미엄 요가매트 공동구매',
                                    description: '라이프폼 요가매트 공동구매. 정품 인증된 제품만 취급',
                                    creatorId: createdUsers[0].id,
                                    status: client_1.PurchaseStatus.CANCELLED,
                                    minParticipants: 30,
                                    maxParticipants: 300,
                                    currentParticipants: 150,
                                    auctionStartTime: new Date(new Date().setDate(new Date().getDate() - 20)),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() - 10)),
                                    imageUrl: 'https://via.placeholder.com/400x300/800080/FFFFFF?text=Yoga+Mat',
                                    voteStartTime: new Date(new Date().setDate(new Date().getDate() - 25)),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() - 23)),
                                    voteThreshold: 200,
                                    targetPrice: 85000,
                                },
                                {
                                    title: '베스트셀러 도서 세트',
                                    description: '2024년 상반기 베스트셀러 TOP 10 세트 공동구매. 40% 할인가',
                                    creatorId: createdUsers[1].id,
                                    status: client_1.PurchaseStatus.RECRUITING,
                                    minParticipants: 3,
                                    maxParticipants: 30,
                                    currentParticipants: 15,
                                    auctionStartTime: new Date(),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 4)),
                                    imageUrl: 'https://via.placeholder.com/400x300/FFA500/000000?text=Books',
                                    voteStartTime: new Date(),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() + 1)),
                                    voteThreshold: 20,
                                    targetPrice: 250000,
                                },
                                {
                                    title: '스마트워치 특가 공동구매',
                                    description: '갤럭시 워치 6 프로 공동구매. 통신사 공시지원금 포함 최저가',
                                    creatorId: createdUsers[2].id,
                                    status: client_1.PurchaseStatus.RECRUITING,
                                    minParticipants: 25,
                                    maxParticipants: 250,
                                    currentParticipants: 125,
                                    auctionStartTime: new Date(),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 9)),
                                    imageUrl: 'https://via.placeholder.com/400x300/008000/FFFFFF?text=Smart+Watch',
                                    voteStartTime: new Date(),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() + 3)),
                                    voteThreshold: 150,
                                    targetPrice: 450000,
                                },
                                {
                                    title: '차량용 공기청정기 공동구매',
                                    description: '샤오미 차량용 공기청정기 신제품 공동구매. 관부가세 포함가',
                                    creatorId: createdUsers[0].id,
                                    status: client_1.PurchaseStatus.RECRUITING,
                                    minParticipants: 6,
                                    maxParticipants: 60,
                                    currentParticipants: 30,
                                    auctionStartTime: new Date(),
                                    auctionEndTime: new Date(new Date().setDate(new Date().getDate() + 7)),
                                    imageUrl: 'https://via.placeholder.com/400x300/000080/FFFFFF?text=Car+Purifier',
                                    voteStartTime: new Date(),
                                    voteEndTime: new Date(new Date().setDate(new Date().getDate() + 2)),
                                    voteThreshold: 40,
                                    targetPrice: 95000,
                                },
                            ],
                        })];
                case 5:
                    groupPurchases = _a.sent();
                    console.log('Seed data created successfully');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
