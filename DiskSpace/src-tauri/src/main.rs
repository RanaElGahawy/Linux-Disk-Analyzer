use rayon::prelude::*;
use serde::{Serialize, Deserialize};
use std::error::Error;
use std::ffi::OsStr;
use std::fs;
use std::path::{Path, PathBuf};
use std::fs::File;
use std::io::prelude::*;
//use std::sync::Exclusive;
//use std::sync::Exclusive;
use std::time::SystemTime;
//use convert_js::ToJs;
use rand::Rng;
//#[derive(ToJs)]
// use std::{fs};
use chrono::{Timelike, Utc, Datelike};
use chrono :: Duration;


#[derive(Serialize, Deserialize)]
pub struct Tree {
    pub id: i32,
    pub text: String,
    pub children: Option<Vec<Tree>>,
}
impl Tree {
    pub fn from_analyze(path: &Path, apparent: bool, root_dev: u64,) -> Result<Self, Box<dyn Error>> {
        let di_path = path.as_os_str().to_string_lossy().to_string();
        let text = path
            .file_name()
            .unwrap_or(&OsStr::new("."))
            .to_string_lossy()
            .to_string();
        let md = path.metadata()?;
        let file_info = FileInfo::from_path(path, apparent)?;
        let id = rand::thread_rng().gen_range(1..=1000000000);
      
        match file_info {
            FileInfo::Directory { volume_id } => {
                if volume_id != root_dev {
                    return Err("Filesystem boundary crossed".into());
                }

                let sub_entries = fs::read_dir(path)?
                    .filter_map(Result::ok)
                    .collect::<Vec<_>>();

                let mut sub_items = sub_entries
                    .par_iter()
                    .filter_map(|entry| {
                        Tree::from_analyze(&entry.path(), apparent, root_dev).ok()
                    })
                    .collect::<Vec<_>>();
                    // sub_items.sort_unstable_by(|a, b| a.value.cmp(&b.value).reverse());
                    // let disk_size = sub_items.iter().map(|di| di.value).sum();
                
                Ok(Tree{                    
                    id,
                    text,
                    children: Some(sub_items),
                })
            }
            FileInfo::File { size, .. } => {
              let veco2: Vec<Tree> = Vec::new();
              Ok(Tree{
                id,
                text,
                children: Some(veco2),
            })},
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct PieChart {
    pub name: String,
    pub description: String,
    pub value: u64,
    pub children: Option<Vec<PieChart>>,
}

impl PieChart {
    pub fn from_analyze(path: &Path, apparent: bool, root_dev: u64,) -> Result<Self, Box<dyn Error>> {
        let di_path = path.as_os_str().to_string_lossy().to_string();
        let name = path
            .file_name()
            .unwrap_or(&OsStr::new("."))
            .to_string_lossy()
            .to_string();
        let md = path.metadata()?;
        let file_info = FileInfo::from_path(path, apparent)?;

        match file_info {
            FileInfo::Directory { volume_id } => {
                if volume_id != root_dev {
                    return Err("Filesystem boundary crossed".into());
                }

                let sub_entries = fs::read_dir(path)?
                    .filter_map(Result::ok)
                    .collect::<Vec<_>>();

                let mut sub_items = sub_entries
                    .par_iter()
                    .filter_map(|entry| {
                        PieChart::from_analyze(&entry.path(), apparent, root_dev).ok()
                    })
                    .collect::<Vec<_>>();
                sub_items.sort_unstable_by(|a, b| a.value.cmp(&b.value).reverse());
                let disk_size = sub_items.iter().map(|di| di.value).sum();

                Ok(PieChart{
                    
                    name,
                    description: format!("{} bytes", disk_size),
                    value: disk_size,
                    children: Some(sub_items),
                })
            }
            FileInfo::File { size, .. } => {
              let veco: Vec<PieChart> = Vec::new();
              Ok(PieChart{
                name,
                description: format!("{} bytes", size),
                value: size,
                children: Some(veco),
            })},
        }
    }
}

#[tauri::command]
fn to_table_test() -> String
{
    let s = r#"[{"id":1,"name":"OliBob","progress":12,"gender":"male", "rating":1, "col": "red", "dob":"19/02/1984", "car":1},
    {"id":2, "name":"Mary May", "progress":1, "gender":"female", "rating":2, "col":"blue", "dob":"14/05/1982", "car":true}]"#;

    let m = s.into();
    return m;
}

#[tauri::command]
fn toPieChart (path: &str) -> String
{
  let current_dir : PathBuf = PathBuf :: from (path);
  let file_info = FileInfo::from_path(&current_dir, true);

  let analysed = match file_info.unwrap() {
      FileInfo::Directory { volume_id } => {
          PieChart::from_analyze(&current_dir, true, volume_id)
      }
      _ => return format!("{} is not a directory!", current_dir.display()).into(),
  };

  let serialized = serde_json::to_string_pretty(&analysed.unwrap());
  return serialized.unwrap();
}

#[tauri::command]
fn toTree (path : &str) -> String
{
  let current_dir : PathBuf = PathBuf :: from (path);
  let file_info = FileInfo::from_path(&current_dir, true);

  let analysed = match file_info.unwrap() {
      FileInfo::Directory { volume_id } => {
          Tree::from_analyze(&current_dir, true, volume_id)
      }
      _ => return format!("{} is not a directory!", current_dir.display()).into(),
  };

  let serialized = serde_json::to_string_pretty(&analysed.unwrap());
  return serialized.unwrap();
}


pub enum FileInfo {
    File { size: u64, volume_id: u64 },
    Directory { volume_id: u64 },
}

impl FileInfo {
    #[cfg(unix)]
    pub fn from_path(path: &Path, apparent: bool) -> Result<Self, Box<dyn Error>> {
        use std::os::unix::fs::MetadataExt;

        let md = path.symlink_metadata()?;
        if md.is_dir() {
            Ok(FileInfo::Directory {
                volume_id: md.dev(),
            })
        } else {
            let size = if apparent {
                md.blocks() * 512
            } else {
                md.len()
            };
            Ok(FileInfo::File {
                size,
                volume_id: md.dev(),
            })
        }
    }
}


#[derive(Serialize, Deserialize)]
struct file 
{
    pub di_path: String,
    pub name: String,
    pub disk_size: u64,
    pub is_directory : bool,
    pub modified_time :String,
    pub modified_date :String,
    pub created_time :String,
    pub created_date :String,
    pub accessed_time :String,
    pub accessed_date :String,
}

fn build_file( di_path: String, name: String, disk_size: u64, is_directory : bool, modified_time :String, modified_date :String, 
    created_time :String, created_date :String, accessed_time :String, accessed_date :String) -> file {
    file {
        di_path,
        name,
        disk_size,
        is_directory,
        modified_time,
        modified_date,
        created_time,
        created_date,
        accessed_time,
        accessed_date,
    }
}


// fn temp() -> Result<String, Box<dyn Error>> {
//     let current_dir : PathBuf = PathBuf :: from ("/home/rana");
//     let file_info = FileInfo::from_path(&current_dir, true)?;

//     let analysed = match file_info {
//         FileInfo::Directory { volume_id } => {
//             DiskItem::from_analyze(&current_dir, true, volume_id)?
//         }
//         _ => return Err(format!("{} is not a directory!", current_dir.display()).into()),
//     };

//     let mut filejson = File::create("frontend.json")?;
//     let serialized = serde_json::to_string_pretty(&analysed)?;

//     filejson.write_all(serialized.as_bytes())?;

//     Ok(serialized)
// }


#[tauri::command]
fn table(path: &str)  -> String
{
    let serialized : String;

    let dirpath = Path::new(path);
    let md = dirpath.metadata().unwrap();
    let name = dirpath.file_name().unwrap().to_os_string().into_string().unwrap();
    let path = dirpath.display().to_string();

    let modifiedtime = md.modified().unwrap().elapsed().unwrap().as_secs();
    let createdtime = md.created().unwrap().elapsed().unwrap().as_secs();
    let accessedtime = md.accessed().unwrap().elapsed().unwrap().as_secs();

    let now = Utc::now();

    let duration_mt = Duration::seconds(modifiedtime as i64);
    let _mt = now.checked_sub_signed(duration_mt).unwrap_or(now);
    let (is_pm_mt, hour_mt) = now.hour12();
    let modified_time = format!("{:02}:{:02}:{:02} {}", (hour_mt+2).to_string(), _mt.minute().to_string(), _mt.second().to_string(), if is_pm_mt{ "PM" } else { "AM" });
    let modified_date = format!("{}-{:02}-{:02} {}", _mt.year().to_string(), _mt.month().to_string(), _mt.day().to_string(), _mt.weekday().to_string());

    let duration_at = Duration::seconds(accessedtime as i64);
    let _at = now.checked_sub_signed(duration_at).unwrap_or(now);
    let (is_pm_at, hour_at) = now.hour12();
    let accessed_time = format!("{:02}:{:02}:{:02} {}", (hour_at+2).to_string(), _at.minute().to_string(), _at.second().to_string(), if is_pm_at{ "PM" } else { "AM" });
    let accessed_date = format!("{}-{:02}-{:02} {}", _at.year().to_string(), _at.month().to_string(), _at.day().to_string(), _at.weekday().to_string());


    let duration_ct = Duration::seconds(createdtime as i64);
    let _ct = now.checked_sub_signed(duration_ct).unwrap_or(now);
    let (is_pm_ct, hour_ct) = now.hour12();
    let created_time = format!("{:02}:{:02}:{:02} {}", (hour_ct+2).to_string(), _ct.minute().to_string(), _ct.second().to_string(), if is_pm_ct{ "PM" } else { "AM" });
    let created_date = format!("{}-{:02}-{:02} {}", _ct.year().to_string(), _ct.month().to_string(), _ct.day().to_string(), _ct.weekday().to_string());
    let mut _size : u64 = 0;

    if md.is_dir()
    {
        let mut children: Vec<file> = vec![];

        for en in fs::read_dir(&dirpath).unwrap()
        {
            let en = en.unwrap();
            let file_path = Path::new(&en.path()).to_owned();
            let fmd = en.metadata().unwrap();
            let fname = en.file_name().to_os_string().into_string().unwrap();
            let fpath = file_path.display().to_string();
            let f_disk_size = fmd.len();
            _size = _size + f_disk_size;

            let fmodifiedtime = fmd.modified().expect("REASON").elapsed().unwrap().as_secs();
            let fcreatedtime = fmd.created().expect("REASON").elapsed().unwrap().as_secs();
            let faccessedtime = fmd.accessed().expect("REASON").elapsed().unwrap().as_secs();
                
            let fduration_mt = Duration::seconds(fmodifiedtime as i64);
            let f_mt = now.checked_sub_signed(fduration_mt).unwrap_or(now);
            let (fis_pm_mt, fhour_mt) = now.hour12();
            let fmodified_time = format!("{:02}:{:02}:{:02} {}", (fhour_mt+2).to_string(), f_mt.minute().to_string(), f_mt.second().to_string(), if fis_pm_mt{ "PM" } else { "AM" });
            let fmodified_date = format!("{}-{:02}-{:02} {}", f_mt.year().to_string(), f_mt.month().to_string(), f_mt.day().to_string(), f_mt.weekday().to_string());
        
            let fduration_at = Duration::seconds(faccessedtime as i64);
            let f_at = now.checked_sub_signed(fduration_at).unwrap_or(now);
            let (fis_pm_at, fhour_at) = now.hour12();
            let faccessed_time = format!("{:02}:{:02}:{:02} {}", (fhour_at+2).to_string(), f_at.minute().to_string(), f_at.second().to_string(), if fis_pm_at{ "PM" } else { "AM" });
            let faccessed_date = format!("{}-{:02}-{:02} {}", f_at.year().to_string(), f_at.month().to_string(), f_at.day().to_string(), f_at.weekday().to_string());
        
            let f_is_directory = fmd.is_dir();
        
            let fduration_ct = Duration::seconds(fcreatedtime as i64);
            let f_ct = now.checked_sub_signed(fduration_ct).unwrap_or(now);
            let (fis_pm_ct, fhour_ct) = now.hour12();
            let fcreated_time = format!("{:02}:{:02}:{:02} {}", (fhour_ct+2).to_string(), f_ct.minute().to_string(), f_ct.second().to_string(), if fis_pm_ct{ "PM" } else { "AM" });
            let fcreated_date = format!("{}-{:02}-{:02} {}", f_ct.year().to_string(), f_ct.month().to_string(), f_ct.day().to_string(), f_ct.weekday().to_string());

            let fresult = build_file(fpath, fname, f_disk_size, f_is_directory, fmodified_time, fmodified_date, fcreated_time, fcreated_date, faccessed_time, faccessed_date);
            children.push(fresult);
            
        }        

        // if ss == 1
        // {
        //     children.sort_unstable_by(|a, b| a.disk_size.cmp(&b.disk_size).reverse());
        //     // sorting using the size
        // }
        // else if ss == 2
        // {
        //     children.sort_unstable_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        //     // sorting alphabetically 
        // }
       serialized = serde_json::to_string_pretty(&children).unwrap();

    }
    else {

        let disk_size = md.len();
        let result = build_file(path, name, disk_size, false, modified_time, modified_date, created_time, created_date, accessed_time, accessed_date);
        serialized = serde_json::to_string_pretty(&result).unwrap();

    }
    // println!("{}", serialized);
    return serialized;
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![toPieChart, toTree, table])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
