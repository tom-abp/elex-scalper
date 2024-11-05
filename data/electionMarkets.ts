import { Side } from "@polymarket/clob-client";

export type ElectionMarket<T1 extends string = string, T2 extends string = string> = {
  name: string;
  options: [T1, T2];
  marketsByOption: Record<T1 | T2, {
    name: T1 | T2;
    betfair:{
      marketId: string;
      selectionId: number;
    };
    polymarket:{
      tokenId: string;
    }[]
  }>
}

export const electionMarkets: ElectionMarket[] = [
  {
    name: "Next President",
    options: ['TRUMP', 'HARRIS'],
    marketsByOption:{
      TRUMP:{
        name: "TRUMP",
        betfair:{
          marketId: "1.176878927",
          selectionId: 10874213
        },
        polymarket:[
          {
            tokenId: "21742633143463906290569050155826241533067272736897614950488156847949938836455",
          },
          {
            tokenId: "87584955359245246404952128082451897287778571240979823316620093987046202296181",
          },
        ]
      },
      HARRIS:{
        name: "HARRIS",
        betfair:{
          marketId: "1.176878927",
          selectionId: 12126964
        },
        polymarket:[
          {
            tokenId: "69236923620077691027083946871148646972011131466059644796654161903044970987404",
          },
          {
            tokenId: "48331043336612883890938759509493159234755048973500640148014422747788308965732",
          },
        ]
      }
    }
  },
  {
    name: "Popular Vote",
    options: ['TRUMP', 'HARRIS'],
    marketsByOption:{
      TRUMP:{
        name: "TRUMP",
        betfair:{
          marketId: "1.178165812",
          selectionId: 10874213
        },
        polymarket:[
          {
            tokenId: "42699080635179861375280720242213672850141860123562672932351602811041149946128",
          },
          {
            tokenId: "43898019188443109254544011644141095748327433947336326565220861409147408981284",
          },
        ]
      },
      HARRIS:{
        name: "HARRIS",
        betfair:{
          marketId: "1.178165812",
          selectionId: 12126964
        },
        polymarket:[
          {
            tokenId: "21271000291843361249209065706097167029083067325856089903026951915683588703117",
          },
          {
            tokenId: "52646153159016006621189163812433115969858888637703551736022048114666679879653",
          },
        ]
      }
    }
  },
  {
    name: "Harris wins +99.5",
    options: ['YES', 'NO'],
    marketsByOption:{
      YES:{
        name: "YES",
        betfair:{
          marketId: "1.233466024",
          selectionId: 74201728
        },
        polymarket:[
          {
            tokenId: "110182611589505704176280883941585275200645249037402942463797356777944882171668",
          },
        ]
      },
      NO:{
        name: "NO",
        betfair:{
          marketId: "1.233466024",
          selectionId: 74201729
        },
        polymarket:[
          {
            tokenId: "703472062584814411408587996212205203179646194812695742911123851861537110765",
          },
        ]
      }
    }
  },{
    name: "Trump wins +99.5",
    options: ['YES', 'NO'],
    marketsByOption:{
      YES:{
        name: "YES",
        betfair:{
          marketId: "1.233466210",
          selectionId: 11702573
        },
        polymarket:[
          {
            tokenId: "53373081615068277016949051309674773846670616322581148620168701506482046206044",
          },
        ]
      },
      NO:{
        name: "NO",
        betfair:{
          marketId: "1.233466210",
          selectionId: 74201733
        },
        polymarket:[
          {
            tokenId: "112108601397974887983591943696951163631741323956587739399052689080303791907532",
          },
        ]
      }
    }
  },{
    name: "States - Arizona",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.229996509",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "77888176678720060596595785704561867851638990901352765132303721825934989281472",
          },
          {
            tokenId: "24620775411941217389377740965103998876434043106631115627739856378494039307644",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.229996509",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "64972410044896218211047269420581789917870192018252181026286744947120013986348",
          },
          {
            tokenId: "113706817137934173084113171765841465765345118947726422900042392575724414672344",
          },
        ]
      }
    }
  },{
    name: "States - Georgia",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.229997102",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "71266923597682191255015907302921683041435419763570474059916757401212183782544",
          },
          {
            tokenId: "6181401096199368004324244642874162057010167408218412244771664244595886623212",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.229997102",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "10874846387975190407444713373765853114527145924436779240006871443341352408992",
          },
          {
            tokenId: "108978442313549362504454361386679252793404126602822126829816109429393785765883",
          },
        ]
      }
    }
  },{
    name: "States - Michigan",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.229999165",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "67987395510317512691808452556846479650140447681921231570668523107587946046381",
          },
          {
            tokenId: "15594057843994379010830396426972640810046245426525810058698162482005241757000",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.229999165",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "105184348976114274990683066782141725521410345945023353024053078695238621958578",
          },
          {
            tokenId: "85882747446059283518997350779572616984413802718247398490010754008042064685948",
          },
        ]
      }
    }
  },{
    name: "States - Pennsylvania",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.230123429",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "96404870680531697292788145333705429762370661278621665925868256650124167091957",
          },
          {
            tokenId: "80692267952118231579739078214722079301718527753004959099480302005191158711065",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.230123429",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "75951511934878014812323289513632732239356274541965522720897159608390126393735",
          },
          {
            tokenId: "67089287271692871221799799486468743524636060540186332703509386944410510992981",
          },
        ]
      }
    }
  },{
    name: "States - New Hampshire",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.230000498",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "30670722979084148793424221598664470441196435655366270740144523147691023552033",
          },
          {
            tokenId: "91757041354278041432691402724684158729072796258871845153634877058427655210476",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.230000498",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "75196359692989187018411418870859031296447545562973355617507233505746713995861",
          },
          {
            tokenId: "101112146796610785624708973665496320672019351295931003966200195705226652733106",
          },
        ]
      }
    }
  },{
    name: "States - New Mexico",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.230123388",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "107398595209864103976140659304436413092229730249009840752863422164742727107773",
          },
          {
            tokenId: "74752309777830627433740196274593474252840258649601697076181644217804694398323",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.230123388",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "53234527504385216100532577318176113690356715003644951508677664096741436571803",
          },
          {
            tokenId: "36894631291256613251821682384394172987455984176119765022678920079152356397626",
          },
        ]
      }
    }
  },{
    name: "States - Florida",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.229997015",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "12114007747517340384640770826667371719468965613575901863343538277669045189268",
          },
          {
            tokenId: "24428179421778642925238549045985174108302551459497422477934158540719687045975",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.229997015",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "98021166935117039411751630581502824091054448039251810280365647472625878604011",
          },
          {
            tokenId: "42931484859503950946156195721873929060179594500552644597117140385769630841228",
          },
        ]
      }
    }
  },{
    name: "States - North Carolina",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.230123393",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "100038420537482572525556691531865148324318723289388392794253042393988283565188",
          },
          {
            tokenId: "31454277624344502296814136646703964228519023411497330820610411279339678008615",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.230123393",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "25474014705297439146444713942104010240322868585952420291288261803408266882449",
          },
          {
            tokenId: "101272812948536211258847407959163788635306115033157032235160475699617990849525",
          },
        ]
      }
    }
  },{
    name: "States - Nevada",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.230000473",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "23452090462928163585257733383879365528898800849298930788345778676568194082451",
          },
          {
            tokenId: "35352876327642053389894511282626265616296126212238181011612882932646625871390",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.230000473",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "22811156622772246927379314532791131581149105511872861362055243423465705837015",
          },
          {
            tokenId: "18451662766052921550337197202319358927639757816615225507586069380328523693166",
          },
        ]
      }
    }
  },{
    name: "States - Wisconsin",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.230123898",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "7374237615890526880478224649885278725219793468355446734533315746155037370158",
          },
          {
            tokenId: "37895399735091212468277241955774995998030599087730955643490691793429355663153",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.230123898",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "8506489790932625039746959405160059426243994232527626857062384302531008283468",
          },
          {
            tokenId: "9957028331163987805873971753654507302936617692682833719706803039129302643823",
          },
        ]
      }
    }
  },{
    name: "States - Iowa",
    options: ['DEMOCRATS', 'REPUBLICANS'],
    marketsByOption:{
      DEMOCRATS:{
        name: "DEMOCRATS",
        betfair:{
          marketId: "1.229997507",
          selectionId: 1171581
        },
        polymarket:[
          {
            tokenId: "90136725712515143196414609721582845740574932050949368617965803462978935329084",
          },
          {
            tokenId: "42800497514834535295319862450083087870390769783910004033589530448478990803871",
          },
        ]
      },
      REPUBLICANS:{
        name: "REPUBLICANS",
        betfair:{
          marketId: "1.229997507",
          selectionId: 1171580
        },
        polymarket:[
          {
            tokenId: "51333916780794331940122386074682365133249796682848404065652214647384231275041",
          },
          {
            tokenId: "14541076616568928849686647393177813432566250736697700166317020637819720171457",
          },
        ]
      }
    }
  }
];